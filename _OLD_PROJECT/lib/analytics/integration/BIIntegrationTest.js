/**
 * Integration Test for Business Intelligence System with Supabase
 */
import { BusinessIntelligenceSystem } from '../BusinessIntelligenceSystem';
import { BISystemDemo } from '../demo/BISystemDemo';
export class BIIntegrationTest {
    constructor() {
        this.biSystem = null;
        this.demo = null;
    }
    /**
     * Initialize BI system with environment variables
     */
    async initializeBI() {
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            // Check if we have valid credentials
            const hasValidCredentials = supabaseUrl &&
                supabaseKey &&
                supabaseUrl !== 'https://your_project_ref.supabase.co' &&
                supabaseKey !== 'your_supabase_anon_key' &&
                supabaseUrl.includes('supabase.co');
            if (!hasValidCredentials) {
                console.log('⚠️ No valid Supabase credentials found. Running in demo mode.');
                return false;
            }
            console.log('🚀 Initializing BI System with Supabase...');
            this.biSystem = new BusinessIntelligenceSystem(supabaseUrl, supabaseKey);
            this.demo = new BISystemDemo(supabaseUrl, supabaseKey);
            // Test basic connection
            await this.biSystem.initialize();
            console.log('✅ BI System initialized successfully with Supabase!');
            return true;
        }
        catch (error) {
            console.error('❌ BI System initialization failed:', error);
            return false;
        }
    }
    /**
     * Run basic BI system verification
     */
    async runBasicVerification() {
        const results = {
            healthCheck: false,
            dashboard: false,
            charts: false,
            anomalies: false,
            reports: false
        };
        if (!this.biSystem) {
            console.log('❌ BI System not initialized');
            return results;
        }
        const period = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
        };
        try {
            // Health Check
            console.log('🔍 Running health check...');
            const health = await this.biSystem.healthCheck();
            results.healthCheck = health.status !== 'error';
            console.log(`${results.healthCheck ? '✅' : '❌'} Health Check: ${health.status}`);
            // Dashboard
            console.log('📊 Testing dashboard generation...');
            const dashboard = await this.biSystem.generateExecutiveDashboard(period);
            results.dashboard = !!dashboard && !!dashboard.financial;
            console.log(`${results.dashboard ? '✅' : '❌'} Dashboard Generation`);
            // Charts
            console.log('📈 Testing chart generation...');
            const charts = await this.biSystem.generateCharts('financial', period);
            results.charts = Array.isArray(charts);
            console.log(`${results.charts ? '✅' : '❌'} Chart Generation`);
            // Anomalies
            console.log('🔍 Testing anomaly detection...');
            const anomalies = await this.biSystem.detectAnomalies(period);
            results.anomalies = Array.isArray(anomalies);
            console.log(`${results.anomalies ? '✅' : '❌'} Anomaly Detection`);
            // Reports
            console.log('📋 Testing report generation...');
            const report = await this.biSystem.generateCompleteReport(period);
            results.reports = !!report && !!report.id;
            console.log(`${results.reports ? '✅' : '❌'} Report Generation`);
        }
        catch (error) {
            console.error('❌ Basic verification failed:', error);
        }
        return results;
    }
    /**
     * Run complete BI demo if available
     */
    async runCompleteDemo() {
        if (!this.demo) {
            console.log('⚠️ Demo not available - no valid Supabase credentials');
            return false;
        }
        try {
            console.log('🎯 Running complete BI system demonstration...');
            await this.demo.runCompleteDemo();
            console.log('✅ Complete demo finished successfully!');
            return true;
        }
        catch (error) {
            console.error('❌ Complete demo failed:', error);
            return false;
        }
    }
    /**
     * Get integration status summary
     */
    getIntegrationStatus() {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const hasValidCredentials = supabaseUrl &&
            supabaseKey &&
            supabaseUrl !== 'https://your_project_ref.supabase.co' &&
            supabaseKey !== 'your_supabase_anon_key' &&
            supabaseUrl.includes('supabase.co');
        return {
            initialized: !!this.biSystem,
            hasCredentials: hasValidCredentials,
            systemReady: !!this.biSystem && hasValidCredentials
        };
    }
}
// Export singleton instance for global use
export const biIntegrationTest = new BIIntegrationTest();
// Auto-initialize function for browser console
window.testBIIntegration = async () => {
    console.log('🎯 DuduFisio BI Integration Test');
    console.log('================================');
    const initialized = await biIntegrationTest.initializeBI();
    if (initialized) {
        console.log('\\n🧪 Running basic verification...');
        const results = await biIntegrationTest.runBasicVerification();
        console.log('\\n📊 Verification Results:');
        Object.entries(results).forEach(([test, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${test}`);
        });
        const allPassed = Object.values(results).every(Boolean);
        if (allPassed) {
            console.log('\\n🎉 All tests passed! BI system is fully functional.');
            console.log('\\n🚀 You can run a complete demo with:');
            console.log('testBIDemo()');
        }
        else {
            console.log('\\n⚠️ Some tests failed. Check Supabase configuration.');
        }
    }
    else {
        console.log('\\n⚠️ BI System running in demo mode (no Supabase credentials).');
        console.log('\\nTo test with Supabase:');
        console.log('1. Configure VITE_SUPABASE_URL in .env.local');
        console.log('2. Configure VITE_SUPABASE_ANON_KEY in .env.local');
        console.log('3. Reload the application');
    }
    return biIntegrationTest.getIntegrationStatus();
};
// Complete demo function
window.testBIDemo = async () => {
    const success = await biIntegrationTest.runCompleteDemo();
    if (!success) {
        console.log('💡 Complete demo requires valid Supabase credentials.');
    }
    return success;
};
