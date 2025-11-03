
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** dudufisio-AI
- **Date:** 2025-11-03
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** Patient Management CRUD Operations
- **Test Code:** [TC001_Patient_Management_CRUD_Operations.py](./TC001_Patient_Management_CRUD_Operations.py)
- **Test Error:** Login failed with provided credentials, preventing access to the system and further testing of patient record CRUD operations. Reporting the issue and stopping the test as per instructions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:17.874Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/aba36227-f091-4465-b871-2c3c6eb18698
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Multi-Therapist Scheduling with Conflict Prevention
- **Test Code:** [TC002_Multi_Therapist_Scheduling_with_Conflict_Prevention.py](./TC002_Multi_Therapist_Scheduling_with_Conflict_Prevention.py)
- **Test Error:** Login failed with provided credentials; unable to proceed with appointment scheduling tests. Reported the issue and stopped further actions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:22.471Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/749a67a6-63e3-4ec2-a1b1-fa3de25ea323
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Clinical Documentation with Rich Text and Auto-Save
- **Test Code:** [TC003_Clinical_Documentation_with_Rich_Text_and_Auto_Save.py](./TC003_Clinical_Documentation_with_Rich_Text_and_Auto_Save.py)
- **Test Error:** Login failed despite correct credentials; cannot access the system to test SOAP notes features. Reporting issue and stopping further actions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:31.691Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/f2f46a66-f199-4715-9e56-b279c2d61c33
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** AI Assistant Generates Reports and Treatment Suggestions
- **Test Code:** [TC004_AI_Assistant_Generates_Reports_and_Treatment_Suggestions.py](./TC004_AI_Assistant_Generates_Reports_and_Treatment_Suggestions.py)
- **Test Error:** Login failed silently on the login page with valid credentials. Unable to proceed with testing Google Gemini AI integration for clinical reports, treatment suggestions, and risk analyses. Please fix the login issue to enable further testing.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:22.154Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/a289f8eb-badf-4c83-a80f-d02e65ef42b9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Exercise Library Content and Personalized Prescription
- **Test Code:** [TC005_Exercise_Library_Content_and_Personalized_Prescription.py](./TC005_Exercise_Library_Content_and_Personalized_Prescription.py)
- **Test Error:** Login failed with provided credentials; cannot proceed to verify exercise library or personalized exercise prescriptions. Issue reported for investigation.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:32.567Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ForgotPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/RegisterPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ResetPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/auth/TwoFactorSetupPage:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/3e1f151e-89e6-4490-8be0-0648e2e223ea
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Patient Portal Secure Access and Data Presentation
- **Test Code:** [TC006_Patient_Portal_Secure_Access_and_Data_Presentation.py](./TC006_Patient_Portal_Secure_Access_and_Data_Presentation.py)
- **Test Error:** Login with valid credentials failed to authenticate and did not redirect to patient portal dashboard. No error messages were shown. Further testing cannot proceed until this issue is resolved. Reporting this issue and stopping the test as per instructions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:32.706Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
[WARNING] ⚠️ Performance issue in AppRoutes: 52.300000000046566ms (at http://localhost:5173/lib/performanceOptimizations.ts:306:18)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/auth/TwoFactorSetupPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ResetPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/RegisterPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ForgotPasswordPage:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/e60a93f2-2a20-4c62-b8e7-5a589b606f86
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Interactive Dashboards and Exportable Reports
- **Test Code:** [TC007_Interactive_Dashboards_and_Exportable_Reports.py](./TC007_Interactive_Dashboards_and_Exportable_Reports.py)
- **Test Error:** Login functionality is broken or unresponsive. Cannot proceed with dashboard validation without successful login. Reporting issue and stopping test.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] TypeError: Failed to fetch
    at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:4873:23
    at _handleRequest2 (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5154:20)
    at _request (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5144:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:6838:21)
    at http://localhost:5173/services/auth/supabaseAuthService.ts:300:25
    at RetryManager.execute (http://localhost:5173/lib/retryManager.ts:27:30)
    at retryApiCall (http://localhost:5173/lib/retryManager.ts:127:23)
    at SupabaseAuthService.login (http://localhost:5173/services/auth/supabaseAuthService.ts:299:37)
    at async http://localhost:5173/contexts/SupabaseAuthContext.tsx:38:22
    at async handleSubmit (http://localhost:5173/pages/auth/LoginPage.tsx:105:7) (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5155:12)
[ERROR] [2025-11-03T05:03:52.679Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Failed to fetch, errorCode: undefined} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/a7fe63aa-55cb-48e2-82ac-9c4df656dc0f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Financial Management with Payment Tracking and Multi-Payment Integration
- **Test Code:** [TC008_Financial_Management_with_Payment_Tracking_and_Multi_Payment_Integration.py](./TC008_Financial_Management_with_Payment_Tracking_and_Multi_Payment_Integration.py)
- **Test Error:** Login failed despite correct credentials. Cannot proceed with testing financial management features such as payment tracking, revenue reports, and multi-payment methods. Reported the issue and stopped further actions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] TypeError: Failed to fetch
    at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:4873:23
    at _handleRequest2 (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5154:20)
    at _request (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5144:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:6838:21)
    at http://localhost:5173/services/auth/supabaseAuthService.ts:300:25
    at RetryManager.execute (http://localhost:5173/lib/retryManager.ts:27:30)
    at retryApiCall (http://localhost:5173/lib/retryManager.ts:127:23)
    at SupabaseAuthService.login (http://localhost:5173/services/auth/supabaseAuthService.ts:299:37)
    at async http://localhost:5173/contexts/SupabaseAuthContext.tsx:38:22
    at async handleSubmit (http://localhost:5173/pages/auth/LoginPage.tsx:105:7) (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5155:12)
[ERROR] [2025-11-03T05:03:52.319Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Failed to fetch, errorCode: undefined} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/61a9283d-0507-4d06-bc70-19b12b979ba5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Inventory Control with Stock Alerts and Movement History
- **Test Code:** [TC009_Inventory_Control_with_Stock_Alerts_and_Movement_History.py](./TC009_Inventory_Control_with_Stock_Alerts_and_Movement_History.py)
- **Test Error:** The inventory system validation task could not be completed because login to the system failed despite using the provided valid credentials. The page remained on the login screen without any error message or navigation to the dashboard. This prevents any further testing of inventory stock movements, alerts, and history. The login issue has been reported as a website problem. Task is now complete with failure to proceed beyond login.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:21.708Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/4e7e6e47-43e7-412c-97ec-a52725bbe3bc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Communication CRM with WhatsApp Integration
- **Test Code:** [TC010_Communication_CRM_with_WhatsApp_Integration.py](./TC010_Communication_CRM_with_WhatsApp_Integration.py)
- **Test Error:** Login to the CRM system failed with provided credentials. Unable to proceed with testing WhatsApp notification and messaging features. Reporting the issue and stopping the test.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:33.875Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/RegisterPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/auth/TwoFactorSetupPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ForgotPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ResetPasswordPage:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/8136ce79-5371-4daf-bd4a-f898aed319b3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Teleconsultation Functionality including Video Conferencing and Session History
- **Test Code:** [TC011_Teleconsultation_Functionality_including_Video_Conferencing_and_Session_History.py](./TC011_Teleconsultation_Functionality_including_Video_Conferencing_and_Session_History.py)
- **Test Error:** Login to the teleconsultation system failed repeatedly with valid credentials. Unable to proceed with testing video calls, scheduling, and session history features. Reporting the issue and stopping further actions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:31.750Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/b93f8677-1b00-4440-a2af-313d4b897812
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Gamification System for Patient Engagement
- **Test Code:** [TC012_Gamification_System_for_Patient_Engagement.py](./TC012_Gamification_System_for_Patient_Engagement.py)
- **Test Error:** Testing stopped due to inability to login with provided credentials. Cannot access gamification features to perform tests.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:33.005Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/RegisterPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ForgotPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/ResetPasswordPage:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/pages/auth/TwoFactorSetupPage:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/4ee5b173-bcb6-4a3d-bbba-623331f48abf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Educational Materials Library Functionality
- **Test Code:** [TC013_Educational_Materials_Library_Functionality.py](./TC013_Educational_Materials_Library_Functionality.py)
- **Test Error:** The login attempt with the provided credentials did not proceed beyond the login page, preventing access to the educational materials. The issue has been reported. Task is now complete and stopped as requested.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] TypeError: Failed to fetch
    at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:4873:23
    at _handleRequest2 (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5154:20)
    at _request (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5144:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:6838:21)
    at http://localhost:5173/services/auth/supabaseAuthService.ts:300:25
    at RetryManager.execute (http://localhost:5173/lib/retryManager.ts:27:30)
    at retryApiCall (http://localhost:5173/lib/retryManager.ts:127:23)
    at SupabaseAuthService.login (http://localhost:5173/services/auth/supabaseAuthService.ts:299:37)
    at async http://localhost:5173/contexts/SupabaseAuthContext.tsx:38:22
    at async handleSubmit (http://localhost:5173/pages/auth/LoginPage.tsx:105:7) (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5155:12)
[ERROR] [2025-11-03T05:03:44.707Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Failed to fetch, errorCode: undefined} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/c343b507-e5d4-42ee-a317-aa2714f781b0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Secure Authentication with Role-Based Access and Password Recovery
- **Test Code:** [TC014_Secure_Authentication_with_Role_Based_Access_and_Password_Recovery.py](./TC014_Secure_Authentication_with_Role_Based_Access_and_Password_Recovery.py)
- **Test Error:** User registration testing was blocked by a persistent backend InternalServerError related to email validation, despite using valid email formats and strong passwords. The issue was reported. Further testing of login, role-based access control, and password recovery workflows could not be completed due to this blocking error. Please resolve the backend issue to enable full testing of user workflows and security compliance.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 422 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/signup:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/signup:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/signup:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/signup:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/a2ee2485-e451-4198-92d9-28cfda975c75
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** LGPD Compliance with Data Encryption, Audit Logs, and Access Controls
- **Test Code:** [TC015_LGPD_Compliance_with_Data_Encryption_Audit_Logs_and_Access_Controls.py](./TC015_LGPD_Compliance_with_Data_Encryption_Audit_Logs_and_Access_Controls.py)
- **Test Error:** Login failure prevents access to patient data. Cannot proceed with LGPD compliance verification steps. Reporting issue and stopping further actions.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] [2025-11-03T05:03:21.410Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Invalid login credentials, errorCode: invalid_credentials} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
[WARNING] ⚠️ Performance issue in AppRoutes: 51.70000000111759ms (at http://localhost:5173/lib/performanceOptimizations.ts:306:18)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/795475b3-d415-4ebc-911f-0db383ae166b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Performance Testing for Page Load and System Availability
- **Test Code:** [TC016_Performance_Testing_for_Page_Load_and_System_Availability.py](./TC016_Performance_Testing_for_Page_Load_and_System_Availability.py)
- **Test Error:** Login attempt with provided credentials failed; the system did not proceed beyond the login screen. This blocks further performance testing as access to the system is not possible. Reporting this issue and stopping the test.
Browser Console Logs:
[ERROR] ❌ Promise rejeitada não tratada: RangeError: Incorrect locale information provided
    at new Locale (<anonymous>)
    at isRTL (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2470:20)
    at getReadingDirection (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2477:10)
    at getDefaultLocale (http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2484:16)
    at http://localhost:5173/node_modules/.vite/deps/chunk-V5Q5FE4T.js?v=6f939791:2487:21 (at http://localhost:5173/lib/monitoring/initMonitoring.ts:16:12)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://urfxniitfbbvsaskicfo.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] TypeError: Failed to fetch
    at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:4873:23
    at _handleRequest2 (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5154:20)
    at _request (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5144:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:6838:21)
    at http://localhost:5173/services/auth/supabaseAuthService.ts:300:25
    at RetryManager.execute (http://localhost:5173/lib/retryManager.ts:27:30)
    at retryApiCall (http://localhost:5173/lib/retryManager.ts:127:23)
    at SupabaseAuthService.login (http://localhost:5173/services/auth/supabaseAuthService.ts:299:37)
    at async http://localhost:5173/contexts/SupabaseAuthContext.tsx:38:22
    at async handleSubmit (http://localhost:5173/pages/auth/LoginPage.tsx:105:7) (at http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=e777fd56:5155:12)
[ERROR] [2025-11-03T05:03:52.930Z] ERROR ❌ Login Supabase falhou {component: supabaseAuthService, action: login, email: admin@dudufisio.com, error: Failed to fetch, errorCode: undefined} undefined (at http://localhost:5173/lib/secureLogger.ts:143:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fad565a3-fad7-4647-9393-5d68b38c58a1/70c81222-7711-459a-882e-820b6d05f472
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---