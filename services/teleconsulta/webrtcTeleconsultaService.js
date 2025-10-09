// WebRTC teleconsulta service for real-time video consultations
import { createClient } from '@supabase/supabase-js';
class WebRTCTeleconsultaService {
    constructor() {
        this.peerConnections = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        this.mediaRecorder = null;
        this.recordingData = [];
        this.websocket = null;
        this.currentSession = null;
        this.isScreenSharing = false;
        // WebRTC configuration
        this.rtcConfiguration = {
            iceServers: [
                // Google's public STUN servers
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                // Custom TURN servers (would be configured in production)
                {
                    urls: 'turn:turn.dudufisio.com:3478',
                    username: import.meta.env.TURN_USERNAME || 'default',
                    credential: import.meta.env.TURN_PASSWORD || 'default',
                },
            ],
            iceCandidatePoolSize: 10,
        };
        this.supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
        this.setupWebSocketConnection();
    }
    setupWebSocketConnection() {
        const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
        this.websocket = new WebSocket(wsUrl);
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 3 seconds
            setTimeout(() => this.setupWebSocketConnection(), 3000);
        };
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    handleWebSocketMessage(message) {
        const { type, data } = message;
        switch (type) {
            case 'offer':
                this.handleOffer(data);
                break;
            case 'answer':
                this.handleAnswer(data);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(data);
                break;
            case 'participant-joined':
                this.handleParticipantJoined(data);
                break;
            case 'participant-left':
                this.handleParticipantLeft(data);
                break;
            case 'chat-message':
                this.handleChatMessage(data);
                break;
            case 'screen-share-started':
                this.handleScreenShareStarted(data);
                break;
            case 'screen-share-ended':
                this.handleScreenShareEnded(data);
                break;
            default:
                console.warn('Unknown WebSocket message type:', type);
        }
    }
    async createTeleconsultaSession(appointmentId, patientId, therapistId, features = {}) {
        const session = {
            id: crypto.randomUUID(),
            appointmentId,
            patientId,
            therapistId,
            status: 'scheduled',
            scheduledAt: new Date(),
            quality: {},
            features: {
                recording: false,
                screenShare: true,
                chat: true,
                whiteBoard: true,
                fileShare: true,
                ...features,
            },
            roomUrl: `${window.location.origin}/teleconsulta/${crypto.randomUUID()}`,
            connectionInfo: {
                stunServers: this.rtcConfiguration.iceServers?.map(server => typeof server.urls === 'string' ? server.urls : server.urls[0]).filter(url => url?.includes('stun:')) || [],
                turnServers: this.rtcConfiguration.iceServers?.filter(server => typeof server.urls === 'string' ? server.urls.includes('turn:') : false).map(server => ({
                    urls: typeof server.urls === 'string' ? server.urls : server.urls[0],
                    username: server.username || '',
                    credential: server.credential || '',
                })) || [],
            },
            participants: [],
            chatHistory: [],
            metadata: {
                platform: navigator.platform,
                browser: navigator.userAgent,
                deviceType: this.detectDeviceType(),
            },
        };
        // Save session to database
        const { error } = await this.supabase
            .from('teleconsulta_sessions')
            .insert(session);
        if (error) {
            throw new Error(`Failed to create teleconsulta session: ${error.message}`);
        }
        return session;
    }
    async joinSession(sessionId, participantInfo) {
        // Get session
        const { data: session, error } = await this.supabase
            .from('teleconsulta_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();
        if (error || !session) {
            throw new Error('Teleconsulta session not found');
        }
        this.currentSession = session;
        // Check device capabilities
        const capabilities = await this.checkDeviceCapabilities();
        const participant = {
            id: crypto.randomUUID(),
            userId: participantInfo.userId,
            name: participantInfo.name,
            role: participantInfo.role,
            email: participantInfo.email,
            joinedAt: new Date(),
            connectionStatus: 'connected',
            audioEnabled: true,
            videoEnabled: true,
            screenShareEnabled: false,
            permissions: {
                canSpeak: true,
                canVideo: true,
                canScreenShare: participantInfo.role !== 'observer',
                canRecord: participantInfo.role === 'therapist',
                canChat: true,
            },
            devices: {},
            stats: {
                bytesReceived: 0,
                bytesSent: 0,
                packetsLost: 0,
                currentRoundTripTime: 0,
            },
        };
        // Update session with new participant
        await this.supabase
            .from('teleconsulta_sessions')
            .update({
            participants: [...session.participants, participant],
            status: session.participants.length === 0 ? 'waiting' : 'active',
        })
            .eq('id', sessionId);
        // Initialize media devices
        await this.initializeMediaDevices(participant);
        // Notify other participants
        this.sendWebSocketMessage('participant-joined', {
            sessionId,
            participant,
        });
        // Start collecting network quality metrics
        this.startNetworkQualityMonitoring();
        return participant;
    }
    async initializeMediaDevices(participant) {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            // Get available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            participant.devices = {
                camera: devices.find(d => d.kind === 'videoinput'),
                microphone: devices.find(d => d.kind === 'audioinput'),
                speaker: devices.find(d => d.kind === 'audiooutput'),
            };
            // Create peer connections for existing participants
            if (this.currentSession) {
                for (const existingParticipant of this.currentSession.participants) {
                    if (existingParticipant.id !== participant.id) {
                        await this.createPeerConnection(existingParticipant.id);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize media devices:', error);
            throw new Error('Failed to access camera/microphone');
        }
    }
    async createPeerConnection(participantId) {
        const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }
        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            this.remoteStreams.set(participantId, remoteStream);
            this.onRemoteStreamAdded?.(participantId, remoteStream);
        };
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendWebSocketMessage('ice-candidate', {
                    candidate: event.candidate,
                    targetParticipant: participantId,
                });
            }
        };
        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${participantId}:`, peerConnection.connectionState);
            if (peerConnection.connectionState === 'failed') {
                // Attempt to reconnect
                this.reconnectPeer(participantId);
            }
        };
        // Monitor stats
        this.monitorPeerConnectionStats(participantId, peerConnection);
        this.peerConnections.set(participantId, peerConnection);
        return peerConnection;
    }
    async monitorPeerConnectionStats(participantId, peerConnection) {
        const statsInterval = setInterval(async () => {
            if (peerConnection.connectionState === 'closed') {
                clearInterval(statsInterval);
                return;
            }
            try {
                const stats = await peerConnection.getStats();
                const statsData = this.parseRTCStats(stats);
                // Update participant stats
                await this.updateParticipantStats(participantId, statsData);
                // Check quality and adapt if necessary
                await this.adaptStreamQuality(participantId, statsData);
            }
            catch (error) {
                console.error('Error monitoring stats:', error);
            }
        }, 5000);
    }
    parseRTCStats(stats) {
        const parsedStats = {
            bytesReceived: 0,
            bytesSent: 0,
            packetsLost: 0,
            currentRoundTripTime: 0,
            jitter: 0,
            frameRate: 0,
            resolution: '',
        };
        stats.forEach((report) => {
            if (report.type === 'inbound-rtp') {
                parsedStats.bytesReceived += report.bytesReceived || 0;
                parsedStats.packetsLost += report.packetsLost || 0;
                parsedStats.jitter = report.jitter || 0;
            }
            else if (report.type === 'outbound-rtp') {
                parsedStats.bytesSent += report.bytesSent || 0;
                parsedStats.frameRate = report.framesPerSecond || 0;
            }
            else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                parsedStats.currentRoundTripTime = report.currentRoundTripTime || 0;
            }
        });
        return parsedStats;
    }
    async adaptStreamQuality(participantId, stats) {
        const peerConnection = this.peerConnections.get(participantId);
        if (!peerConnection)
            return;
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(stats);
        if (qualityScore < 0.5) {
            // Reduce video quality
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
            if (videoSender?.track) {
                const params = videoSender.getParameters();
                if (params.encodings && params.encodings.length > 0) {
                    const encoding = params.encodings[0];
                    if (encoding) {
                        encoding.maxBitrate = Math.max(100000, (encoding.maxBitrate || 1000000) * 0.8);
                    }
                    await videoSender.setParameters(params);
                }
            }
        }
    }
    calculateQualityScore(stats) {
        // Calculate a quality score between 0 and 1
        const rttScore = Math.max(0, 1 - (stats.currentRoundTripTime / 0.5)); // 500ms max
        const packetLossScore = Math.max(0, 1 - (stats.packetsLost / 100)); // 100 packets max
        const jitterScore = Math.max(0, 1 - (stats.jitter / 0.1)); // 100ms max
        return (rttScore + packetLossScore + jitterScore) / 3;
    }
    async startRecording(sessionId, participantId) {
        if (!this.currentSession || this.currentSession.id !== sessionId) {
            throw new Error('No active session');
        }
        // Check permissions
        const participant = this.currentSession.participants.find(p => p.id === participantId);
        if (!participant?.permissions.canRecord) {
            throw new Error('Recording not permitted for this participant');
        }
        // Get consent from all participants
        const consent = await this.getRecordingConsent();
        const recordingSession = {
            id: crypto.randomUUID(),
            sessionId,
            startTime: new Date(),
            format: 'webm',
            quality: '720p',
            status: 'recording',
            participantConsent: consent,
            retentionPeriod: 365, // 1 year
            autoDelete: true,
        };
        try {
            // Create composite stream for recording
            const compositeStream = await this.createCompositeStream();
            this.mediaRecorder = new MediaRecorder(compositeStream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000,
                audioBitsPerSecond: 128000,
            });
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordingData.push(event.data);
                }
            };
            this.mediaRecorder.onstop = async () => {
                await this.finalizeRecording(recordingSession);
            };
            this.mediaRecorder.start(1000); // Collect data every second
            // Save recording session
            await this.supabase
                .from('teleconsulta_recordings')
                .insert(recordingSession);
            return recordingSession;
        }
        catch (error) {
            recordingSession.status = 'failed';
            throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createCompositeStream() {
        // Create a composite video stream from all participants
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        // Composite video streams
        const videoStream = canvas.captureStream(30);
        // Mix audio streams
        this.remoteStreams.forEach(stream => {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                const source = audioContext.createMediaStreamSource(new MediaStream([audioTracks[0]]));
                source.connect(destination);
            }
        });
        // Add local audio
        if (this.localStream) {
            const localAudioTracks = this.localStream.getAudioTracks();
            if (localAudioTracks.length > 0) {
                const source = audioContext.createMediaStreamSource(new MediaStream([localAudioTracks[0]]));
                source.connect(destination);
            }
        }
        // Create composite stream
        const compositeStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
        ]);
        // Start video composition
        this.startVideoComposition(canvas, ctx);
        return compositeStream;
    }
    startVideoComposition(canvas, ctx) {
        const renderFrame = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Layout participants in grid
            const participants = Array.from(this.remoteStreams.keys());
            const totalParticipants = participants.length + (this.localStream ? 1 : 0);
            const cols = Math.ceil(Math.sqrt(totalParticipants));
            const rows = Math.ceil(totalParticipants / cols);
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / rows;
            let index = 0;
            // Draw local stream
            if (this.localStream) {
                const video = this.createVideoElement(this.localStream);
                const x = (index % cols) * cellWidth;
                const y = Math.floor(index / cols) * cellHeight;
                ctx.drawImage(video, x, y, cellWidth, cellHeight);
                index++;
            }
            // Draw remote streams
            participants.forEach(participantId => {
                const stream = this.remoteStreams.get(participantId);
                if (stream) {
                    const video = this.createVideoElement(stream);
                    const x = (index % cols) * cellWidth;
                    const y = Math.floor(index / cols) * cellHeight;
                    ctx.drawImage(video, x, y, cellWidth, cellHeight);
                    index++;
                }
            });
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                requestAnimationFrame(renderFrame);
            }
        };
        renderFrame();
    }
    createVideoElement(stream) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        video.muted = true;
        return video;
    }
    async getRecordingConsent() {
        // In a real implementation, this would show a consent dialog to all participants
        const consent = {};
        if (this.currentSession) {
            for (const participant of this.currentSession.participants) {
                // For now, assume consent is given
                consent[participant.id] = true;
            }
        }
        return consent;
    }
    async finalizeRecording(recording) {
        try {
            // Create blob from recorded data
            const recordingBlob = new Blob(this.recordingData, { type: 'video/webm' });
            // Upload to storage
            const fileName = `recording_${recording.id}_${Date.now()}.webm`;
            const { error: uploadError } = await this.supabase.storage
                .from('teleconsulta-recordings')
                .upload(fileName, recordingBlob);
            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }
            // Get public URL
            const { data } = await this.supabase.storage
                .from('teleconsulta-recordings')
                .getPublicUrl(fileName);
            // Update recording session
            await this.supabase
                .from('teleconsulta_recordings')
                .update({
                status: 'completed',
                endTime: new Date().toISOString(),
                duration: Math.floor((Date.now() - recording.startTime.getTime()) / 1000),
                fileUrl: data.publicUrl,
                fileSize: recordingBlob.size,
            })
                .eq('id', recording.id);
            // Clear recording data
            this.recordingData = [];
        }
        catch (error) {
            await this.supabase
                .from('teleconsulta_recordings')
                .update({
                status: 'failed',
                endTime: new Date().toISOString(),
            })
                .eq('id', recording.id);
            throw error;
        }
    }
    async startScreenShare(participantId) {
        if (this.isScreenSharing) {
            throw new Error('Screen sharing already active');
        }
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { max: 1920 },
                    height: { max: 1080 },
                    frameRate: { max: 30 },
                },
                audio: true,
            });
            const screenShareSession = {
                id: crypto.randomUUID(),
                sessionId: this.currentSession.id,
                participantId,
                startTime: new Date(),
                isActive: true,
                screenType: 'entire_screen',
                hasAudio: screenStream.getAudioTracks().length > 0,
            };
            // Replace video track in peer connections
            for (const [peerId, peerConnection] of this.peerConnections) {
                const videoSender = peerConnection.getSenders().find(sender => sender.track && sender.track.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
                }
            }
            // Handle screen share end
            const videoTrack = screenStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    this.stopScreenShare(screenShareSession.id);
                };
            }
            this.isScreenSharing = true;
            // Notify other participants
            this.sendWebSocketMessage('screen-share-started', {
                sessionId: this.currentSession.id,
                participantId,
                screenShareSession,
            });
            return screenShareSession;
        }
        catch (error) {
            throw new Error(`Failed to start screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async stopScreenShare(screenShareId) {
        if (!this.isScreenSharing)
            return;
        try {
            // Restore camera stream
            if (this.localStream) {
                const videoTrack = this.localStream.getVideoTracks()[0];
                for (const [peerId, peerConnection] of this.peerConnections) {
                    const videoSender = peerConnection.getSenders().find(sender => sender.track && sender.track.kind === 'video');
                    if (videoSender && videoTrack) {
                        await videoSender.replaceTrack(videoTrack);
                    }
                }
            }
            this.isScreenSharing = false;
            // Update screen share session
            await this.supabase
                .from('teleconsulta_screen_shares')
                .update({
                endTime: new Date().toISOString(),
                isActive: false,
            })
                .eq('id', screenShareId);
            // Notify other participants
            this.sendWebSocketMessage('screen-share-ended', {
                sessionId: this.currentSession.id,
                screenShareId,
            });
        }
        catch (error) {
            console.error('Failed to stop screen sharing:', error);
        }
    }
    async sendChatMessage(sessionId, senderId, senderName, message, type = 'text', file) {
        let fileUrl;
        let fileName;
        let fileSize;
        if (file && type === 'file') {
            // Upload file
            const uploadFileName = `chat_${sessionId}_${Date.now()}_${file.name}`;
            const { error: uploadError } = await this.supabase.storage
                .from('teleconsulta-files')
                .upload(uploadFileName, file);
            if (uploadError) {
                throw new Error(`File upload failed: ${uploadError.message}`);
            }
            const { data } = await this.supabase.storage
                .from('teleconsulta-files')
                .getPublicUrl(uploadFileName);
            fileUrl = data.publicUrl;
            fileName = file.name;
            fileSize = file.size;
        }
        const chatMessage = {
            id: crypto.randomUUID(),
            sessionId,
            senderId,
            senderName,
            message,
            type,
            timestamp: new Date(),
            fileUrl,
            fileName,
            fileSize,
        };
        // Save to database
        await this.supabase
            .from('teleconsulta_chat')
            .insert(chatMessage);
        // Send to other participants
        this.sendWebSocketMessage('chat-message', chatMessage);
        return chatMessage;
    }
    async checkDeviceCapabilities() {
        const capabilities = {
            video: {
                maxResolution: '1280x720',
                frameRates: [15, 24, 30],
                codecs: ['VP8', 'VP9', 'H264'],
            },
            audio: {
                sampleRates: [8000, 16000, 48000],
                channels: 2,
                codecs: ['OPUS', 'G722', 'PCMU'],
            },
            screen: {
                canShare: 'getDisplayMedia' in navigator.mediaDevices,
                hasAudio: true,
            },
            bandwidth: {
                estimated: 1000, // kbps
                effective: '4g',
            },
        };
        // Check actual device capabilities
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            const audioDevices = devices.filter(d => d.kind === 'audioinput');
            if (videoDevices.length === 0) {
                capabilities.video.maxResolution = 'none';
            }
            if (audioDevices.length === 0) {
                capabilities.audio.channels = 0;
            }
            // Check network information
            if ('connection' in navigator) {
                const connection = navigator.connection;
                capabilities.bandwidth.effective = connection.effectiveType;
                capabilities.bandwidth.estimated = connection.downlink * 1000; // Convert to kbps
            }
        }
        catch (error) {
            console.warn('Failed to check device capabilities:', error);
        }
        return capabilities;
    }
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/tablet|ipad/.test(userAgent)) {
            return 'tablet';
        }
        else if (/mobile|android|iphone/.test(userAgent)) {
            return 'mobile';
        }
        else {
            return 'desktop';
        }
    }
    startNetworkQualityMonitoring() {
        setInterval(async () => {
            if (this.currentSession) {
                const metrics = await this.measureNetworkQuality();
                await this.updateSessionQuality(this.currentSession.id, metrics);
            }
        }, 10000); // Every 10 seconds
    }
    async measureNetworkQuality() {
        // Simplified network quality measurement
        const startTime = Date.now();
        try {
            // Measure latency with a small request
            await fetch('/api/ping', { method: 'HEAD' });
            const latency = Date.now() - startTime;
            return {
                bandwidth: {
                    download: 1000, // Would measure actual bandwidth
                    upload: 500,
                },
                latency,
                packetLoss: 0, // Would calculate from WebRTC stats
                jitter: 0,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                bandwidth: { download: 0, upload: 0 },
                latency: 999,
                packetLoss: 100,
                jitter: 100,
                timestamp: new Date(),
            };
        }
    }
    async updateSessionQuality(sessionId, metrics) {
        await this.supabase
            .from('teleconsulta_sessions')
            .update({
            quality: {
                latency: metrics.latency,
                packetLoss: metrics.packetLoss,
                jitter: metrics.jitter,
            },
        })
            .eq('id', sessionId);
    }
    async updateParticipantStats(participantId, stats) {
        if (!this.currentSession)
            return;
        const updatedParticipants = this.currentSession.participants.map(p => {
            if (p.id === participantId) {
                return { ...p, stats };
            }
            return p;
        });
        await this.supabase
            .from('teleconsulta_sessions')
            .update({ participants: updatedParticipants })
            .eq('id', this.currentSession.id);
    }
    async reconnectPeer(participantId) {
        console.log(`Attempting to reconnect to participant: ${participantId}`);
        // Close existing connection
        const existingConnection = this.peerConnections.get(participantId);
        if (existingConnection) {
            existingConnection.close();
            this.peerConnections.delete(participantId);
        }
        // Create new connection
        await this.createPeerConnection(participantId);
    }
    sendWebSocketMessage(type, data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type, data }));
        }
    }
    // Event handlers for WebSocket messages
    async handleOffer(data) {
        const { offer, fromParticipant } = data;
        const peerConnection = this.peerConnections.get(fromParticipant) ||
            await this.createPeerConnection(fromParticipant);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        this.sendWebSocketMessage('answer', {
            answer,
            targetParticipant: fromParticipant,
        });
    }
    async handleAnswer(data) {
        const { answer, fromParticipant } = data;
        const peerConnection = this.peerConnections.get(fromParticipant);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(answer);
        }
    }
    async handleIceCandidate(data) {
        const { candidate, fromParticipant } = data;
        const peerConnection = this.peerConnections.get(fromParticipant);
        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate);
        }
    }
    handleParticipantJoined(data) {
        const { participant } = data;
        this.onParticipantJoined?.(participant);
    }
    handleParticipantLeft(data) {
        const { participantId } = data;
        // Clean up peer connection
        const peerConnection = this.peerConnections.get(participantId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(participantId);
        }
        // Remove remote stream
        this.remoteStreams.delete(participantId);
        this.onParticipantLeft?.(participantId);
    }
    handleChatMessage(data) {
        this.onChatMessage?.(data);
    }
    handleScreenShareStarted(data) {
        this.onScreenShareStarted?.(data);
    }
    handleScreenShareEnded(data) {
        this.onScreenShareEnded?.(data);
    }
    // Cleanup methods
    async leaveSession() {
        // Close all peer connections
        for (const [participantId, peerConnection] of this.peerConnections) {
            peerConnection.close();
        }
        this.peerConnections.clear();
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        // Clear remote streams
        this.remoteStreams.clear();
        // Stop recording if active
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        // Close WebSocket
        if (this.websocket) {
            this.websocket.close();
        }
        this.currentSession = null;
    }
    // Public API methods
    async getSessions() {
        const { data, error } = await this.supabase
            .from('teleconsulta_sessions')
            .select('*')
            .order('scheduledAt', { ascending: false });
        if (error) {
            throw new Error(`Failed to get sessions: ${error.message}`);
        }
        return data ?? [];
    }
    async getSessionById(sessionId) {
        const { data, error } = await this.supabase
            .from('teleconsulta_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();
        if (error) {
            throw new Error(`Failed to get session: ${error.message}`);
        }
        return data ?? null;
    }
    async getRecordings(sessionId) {
        const query = this.supabase.from('teleconsulta_recordings').select('*');
        if (sessionId) {
            query.eq('sessionId', sessionId);
        }
        const { data, error } = await query.order('startTime', { ascending: false });
        if (error) {
            throw new Error(`Failed to get recordings: ${error.message}`);
        }
        return data || [];
    }
    // Media controls
    async toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }
    async toggleVideo(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }
    async switchCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                // Switch between front and back camera on mobile
                const constraints = {
                    video: {
                        facingMode: videoTrack.getSettings().facingMode === 'user' ? 'environment' : 'user',
                    },
                    audio: true,
                };
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    // Replace track in peer connections
                    for (const peerConnection of this.peerConnections.values()) {
                        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                        if (sender) {
                            await sender.replaceTrack(newVideoTrack);
                        }
                    }
                    // Stop old track
                    videoTrack.stop();
                    // Update local stream
                    this.localStream.removeTrack(videoTrack);
                    this.localStream.addTrack(newVideoTrack);
                }
                catch (error) {
                    console.error('Failed to switch camera:', error);
                }
            }
        }
    }
}
export const webrtcTeleconsultaService = new WebRTCTeleconsultaService();
