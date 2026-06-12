// Interactive Onboarding Sandbox Simulator & Log Tracing Engine

document.addEventListener('DOMContentLoaded', () => {
    // 1. API Interactive Walkthrough State Simulator
    let simCampaign = {
        id: 'c3f7b9e1-2a4c-47ea-8d4e-6e4b9f2d1e8c',
        user_id: 'demo-user',
        title: 'SaaS Launch Promo',
        brief: 'Summer product launch for our SaaS analytics tool. Target: growth marketers. Highlight 40% faster setup.',
        status: 'uncreated',
        state: {
            tool_calls: [],
            messages: [],
            last_completed_tool: null
        },
        outputs: []
    };

    const simStateDisplay = document.getElementById('sim-state-json');
    const simLogList = document.getElementById('sim-log-list');
    const simStatusText = document.getElementById('sim-status-badge');

    // Simulator Buttons
    const btnCreate = document.getElementById('sim-btn-create');
    const btnRun = document.getElementById('sim-btn-run');
    const btnMessage = document.getElementById('sim-btn-send');
    const txtMessage = document.getElementById('sim-txt-message');
    const inputBrief = document.getElementById('sim-input-brief');

    // Database Visual Rows Elements
    const dbCampaignRow = document.getElementById('db-row-campaign');
    const dbOutputsBody = document.getElementById('db-body-outputs');
    const dbConfigRow = document.getElementById('db-row-config');

    function updateSimulatorUI() {
        if (!simStateDisplay) return; // Exit if not on simulator page

        // Render JSON
        simStateDisplay.textContent = JSON.stringify(simCampaign, null, 2);

        // Status Badge
        simStatusText.textContent = simCampaign.status.toUpperCase();
        simStatusText.className = 'px-3 py-1 text-xs font-semibold rounded-full font-mono ';
        if (simCampaign.status === 'uncreated') simStatusText.classList.add('bg-slate-800', 'text-slate-400');
        else if (simCampaign.status === 'draft') simStatusText.classList.add('bg-slate-100', 'text-slate-800');
        else if (simCampaign.status === 'queued') simStatusText.classList.add('bg-indigo-100', 'text-indigo-800');
        else if (simCampaign.status === 'running') simStatusText.classList.add('bg-amber-100', 'text-amber-800');
        else if (simCampaign.status === 'review') simStatusText.classList.add('bg-purple-100', 'text-purple-800');
        else if (simCampaign.status === 'completed') simStatusText.classList.add('bg-emerald-100', 'text-emerald-800');

        // Toggle button states
        btnCreate.disabled = simCampaign.status !== 'uncreated';
        btnRun.disabled = simCampaign.status !== 'draft';
        btnMessage.disabled = simCampaign.status !== 'completed' && simCampaign.status !== 'review';
        txtMessage.disabled = simCampaign.status !== 'completed' && simCampaign.status !== 'review';

        // Render Database Rows
        if (simCampaign.status === 'uncreated') {
            dbCampaignRow.innerHTML = `<td colspan="5" class="px-6 py-4 text-center text-sm text-slate-400">尚未建立企劃 (No campaigns created yet)</td>`;
            dbOutputsBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-slate-400">尚未產生輸出資產 (No outputs generated yet)</td></tr>`;
            dbConfigRow.innerHTML = `<td colspan="4" class="px-6 py-4 text-center text-sm text-slate-400">尚未初始化設定檔 (No config initialized)</td>`;
        } else {
            // Campaign row
            dbCampaignRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-violet-600 font-semibold">${simCampaign.id.slice(0, 8)}...</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-medium font-sans">${simCampaign.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                    <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full font-mono bg-indigo-50 text-indigo-700">${simCampaign.status}</span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-500 font-mono">${simCampaign.state.tool_calls.length} 節點呼叫</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">剛剛 (Just now)</td>
            `;

            // Config row
            dbConfigRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">uc-58f2d...</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-800 font-mono">demo-user</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium font-sans">professional (品牌預設)</td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium font-sans">growth marketers (受眾)</td>
            `;

            // Outputs
            if (simCampaign.outputs.length === 0) {
                dbOutputsBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-xs text-slate-400">尚未產生輸出資產</td></tr>`;
            } else {
                dbOutputsBody.innerHTML = simCampaign.outputs.map(out => `
                    <tr class="border-b border-slate-100">
                        <td class="px-6 py-3 whitespace-nowrap text-xs font-mono text-purple-600">${out.id.slice(0, 8)}...</td>
                        <td class="px-6 py-3 whitespace-nowrap text-xs font-semibold text-slate-700 font-mono">${out.output_type}</td>
                        <td class="px-6 py-3 text-xs text-slate-500 truncate max-w-[220px]" title="${out.content || JSON.stringify(out.metadata)}">${out.content || JSON.stringify(out.metadata)}</td>
                        <td class="px-6 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">${out.asset_url ? '<a href="#" class="text-violet-600 underline">R2/S3 檔案鏈結</a>' : '無'}</td>
                    </tr>
                `).join('');
            }
        }
    }

    function addLog(message, type = 'info') {
        if (!simLogList) return;
        const item = document.createElement('li');
        item.className = 'flex items-start gap-2 border-b border-slate-800/40 pb-2';

        let indicatorColor = 'bg-blue-500';
        if (type === 'api') indicatorColor = 'bg-violet-500';
        else if (type === 'agent') indicatorColor = 'bg-amber-500';
        else if (type === 'success') indicatorColor = 'bg-emerald-500';
        else if (type === 'error') indicatorColor = 'bg-red-500';

        item.innerHTML = `
            <span class="w-2 h-2 rounded-full ${indicatorColor} mt-1.5 shrink-0"></span>
            <div class="flex-1">
                <p class="text-xs font-semibold text-slate-200 font-sans">${message}</p>
                <span class="text-[9px] text-slate-400 font-mono">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        simLogList.prepend(item);
    }

    // --- Simulator Actions ---
    if (btnCreate) {
        // 1. Create Campaign
        btnCreate.addEventListener('click', () => {
            const brief = inputBrief.value.trim() || 'Default marketing campaign';

            simCampaign = {
                id: 'c3f7b9e1-2a4c-47ea-8d4e-6e4b9f2d1e8c',
                user_id: 'demo-user',
                title: brief.split(/[.!?\n]/)[0].slice(0, 35) + '...',
                brief: brief,
                status: 'draft',
                state: {
                    tool_calls: [],
                    messages: [{
                        role: 'user',
                        content: brief,
                        created_at: new Date().toISOString()
                    }],
                    last_completed_tool: null
                },
                outputs: []
            };

            simLogList.innerHTML = '';
            addLog(`REST HTTP POST /api/v1/campaigns (載荷 Payload: user_id="demo-user", title="...", brief="...")`, 'api');
            addLog(`後端於庫中寫入行記錄，關聯 user_configs。初始化 state.messages 及狀態轉移至 "draft"`, 'success');
            updateSimulatorUI();
        });
    }

    // Helper: Delay function
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    if (btnRun) {
        // 2. Run Campaign Pipeline
        btnRun.addEventListener('click', async () => {
            if (simCampaign.status !== 'draft') return;

            addLog(`REST HTTP POST /api/v1/campaigns/${simCampaign.id.slice(0,8)}.../run (發起後台執行緒)`, 'api');
            simCampaign.status = 'running';
            simCampaign.state.tool_calls = [];
            updateSimulatorUI();

            addLog(`FastAPI background_tasks.add_task(execute_campaign) 啟動，狀態轉移至 status -> "running"`, 'success');
            await sleep(1500);

            // NODE 1: extractor
            const tool1_id = 'tool-e932b1ac';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool1_id,
                tool: 'extract_brief',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[extractor_node] 啟動。呼叫 OpenAI 提取簡報。事務 Commit：state.tool_calls 新增 running 狀態`, 'agent');
            updateSimulatorUI();
            await sleep(2000);

            const out1_id = 'out-e1f4883d';
            simCampaign.outputs.push({
                id: out1_id,
                output_type: 'extracted',
                content: null,
                metadata: {
                    product: 'SaaS Analytics Tool',
                    audience: 'growth marketers',
                    tone: 'professional',
                    key_messages: ['40% setup speedup', 'Realtime monitoring'],
                    constraints: []
                },
                created_at: new Date().toISOString()
            });
            simCampaign.state.tool_calls[0].status = 'completed';
            simCampaign.state.tool_calls[0].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[0].output_ref = out1_id;
            simCampaign.state.last_completed_tool = 'extract_brief';
            simCampaign.state.extracted = simCampaign.outputs[0].metadata;
            addLog(`[extractor_node] 完成。寫入 campaign_outputs 產出表並關聯。事務 Commit: state.tool_calls 轉 completed 且更新 state.extracted 結構`, 'success');
            updateSimulatorUI();
            await sleep(1500);

            // NODE 2: writer
            const tool2_id = 'tool-w8a107ef';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool2_id,
                tool: 'write_copy',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[writer_node] 啟動。ChatOpenAI 整合 prompt 載入對話歷史 messages。`, 'agent');
            updateSimulatorUI();
            await sleep(2500);

            const out2_id = 'out-w2e774aa';
            const copyContent = `🚀 提升您的數據分析效率！\n\n可在 5 分鐘內完成配置，比傳統平台快 40%。即刻洞察系統延遲！\n\n👉 今天立即加入 Launch Week 開源搶先體驗！`;
            simCampaign.outputs.push({
                id: out2_id,
                output_type: 'copy',
                content: copyContent,
                metadata: {},
                created_at: new Date().toISOString()
            });
            simCampaign.state.tool_calls[1].status = 'completed';
            simCampaign.state.tool_calls[1].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[1].output_ref = out2_id;
            simCampaign.state.last_completed_tool = 'write_copy';
            simCampaign.state.copy_draft = copyContent;
            simCampaign.state.messages.push({
                role: 'assistant',
                content: copyContent,
                created_at: new Date().toISOString()
            });
            addLog(`[writer_node] 完成。寫入 campaign_outputs 產出。將生成的 AI 回信追加進 state.messages 歷史以維持連續對話語境。`, 'success');
            updateSimulatorUI();
            await sleep(1500);

            // NODE 3: image
            const tool3_id = 'tool-i53f88dd';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool3_id,
                tool: 'generate_visual',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[image_node] 啟動。調用 DALL-E 3 生成行銷配圖 Prompt，同時發送二進制檔案至 S3/R2 Bucket。`, 'agent');
            updateSimulatorUI();
            await sleep(3000);

            const out3_id = 'out-i38d82cc';
            const imagePrompt = `Modern workspace displaying dashboard with real-time analytics graphs, vibrant violet UI accents, clean vector style.`;
            simCampaign.outputs.push({
                id: out3_id,
                output_type: 'image',
                content: imagePrompt,
                asset_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                metadata: {},
                created_at: new Date().toISOString()
            });
            simCampaign.state.tool_calls[2].status = 'completed';
            simCampaign.state.tool_calls[2].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[2].output_ref = out3_id;
            simCampaign.state.last_completed_tool = 'generate_visual';
            simCampaign.state.image_prompt = imagePrompt;
            simCampaign.state.image_url = simCampaign.outputs[2].asset_url;
            addLog(`[image_node] 完成。已上傳 S3/R2，永久 URL 寫入 campaign_outputs.asset_url`, 'success');
            updateSimulatorUI();
            await sleep(1500);

            // NODE 4: reviewer
            const tool4_id = 'tool-r4bb00cc';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool4_id,
                tool: 'review_outputs',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[reviewer_node] 啟動。Senior Reviewer 進行合規與文圖匹配性審查，生成評分與修改建议。`, 'agent');
            updateSimulatorUI();
            await sleep(2000);

            const out4_id = 'out-r9e10222';
            const reviewMetadata = {
                approved: false, // For demonstration, let's reject to show the "review" state and chat loop!
                score: 72,
                suggestions: ['文案大方向不錯，但請強調這是雲端原生 (cloud-native) 的架構且加上更多表情符號。', '配圖與受眾契合度高。'],
                revised_copy: `🚀 雲端原生 SaaS 數據分析！📊\n\n配置時間縮短 40% (低於 5 分鐘)。準備好與您的團隊一起擴展。\n\n👉 點擊這裡獲取搶先體驗權限！`
            };
            simCampaign.outputs.push({
                id: out4_id,
                output_type: 'review',
                content: reviewMetadata.revised_copy,
                metadata: reviewMetadata,
                created_at: new Date().toISOString()
            });
            simCampaign.state.tool_calls[3].status = 'completed';
            simCampaign.state.tool_calls[3].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[3].output_ref = out4_id;
            simCampaign.state.last_completed_tool = 'review_outputs';
            simCampaign.state.review = reviewMetadata;

            simCampaign.status = 'review'; // Transitioning to "review" because approved is false.
            addLog(`[reviewer_node] 完成。評分 72 未達標 (approved: false)。圖執行結束。後端更新 campaigns.status ➔ "review"`, 'success');
            updateSimulatorUI();
        });
    }

    if (btnMessage) {
        // 3. Send Follow-up Revision Message
        btnMessage.addEventListener('click', async () => {
            const msgText = txtMessage.value.trim();
            if (!msgText || (simCampaign.status !== 'completed' && simCampaign.status !== 'review')) return;

            txtMessage.value = '';
            addLog(`REST HTTP POST /api/v1/campaigns/${simCampaign.id.slice(0,8)}.../messages (載荷 Payload: content="${msgText}")`, 'api');

            // Frontend optimistic UI update
            simCampaign.status = 'running';
            simCampaign.state.tool_calls = [];
            simCampaign.state.last_completed_tool = null;
            simCampaign.state.messages.push({
                role: 'user',
                content: msgText,
                created_at: new Date().toISOString()
            });
            updateSimulatorUI();
            addLog(`樂觀 UI (Optimistic UI) 觸發：本地追加 User 反饋訊息，狀態變更為 running 並重置進度。`, 'info');

            await sleep(1500);

            // In a rerun, nodes execute again.
            // Node 1: extractor (skips or returns quickly)
            const tool1_id = 'tool-e932b1ac-rerun';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool1_id,
                tool: 'extract_brief',
                status: 'completed',
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                output_ref: simCampaign.outputs[0].id
            });
            simCampaign.state.last_completed_tool = 'extract_brief';
            updateSimulatorUI();
            addLog(`[extractor_node] 重跑：檢測到已有 extracted 結構且無 Brief 異動，快速重用並跳過執行。`, 'success');
            await sleep(1000);

            // Node 2: writer (processes new instruction)
            const tool2_id = 'tool-w8a107ef-rerun';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool2_id,
                tool: 'write_copy',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[writer_node] 重跑。ChatOpenAI 整合反饋「${msgText}」與對話歷史。執行修正...`, 'agent');
            updateSimulatorUI();
            await sleep(2500);

            // Update copywriting output
            const revisedCopy = `🚀 雲端原生 SaaS 數據分析！📊\n\n體驗 40% 快速配置 (只需 5 分鐘內！)。可靈活擴展、架構強健且專為成長型團隊打造。\n\n👉 今天立即加入 Launch Week 搶先體驗！`;
            simCampaign.outputs[1].content = revisedCopy;
            simCampaign.outputs[1].created_at = new Date().toISOString();
            simCampaign.state.tool_calls[1].status = 'completed';
            simCampaign.state.tool_calls[1].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[1].output_ref = simCampaign.outputs[1].id;
            simCampaign.state.last_completed_tool = 'write_copy';
            simCampaign.state.copy_draft = revisedCopy;
            simCampaign.state.messages.push({
                role: 'assistant',
                content: revisedCopy,
                created_at: new Date().toISOString()
            });
            addLog(`[writer_node] 重跑完成。覆寫原本的 copy 產出。追加 AI 修正回信至 state.messages 歷史中。`, 'success');
            updateSimulatorUI();
            await sleep(1000);

            // Node 3: image (skips or updates prompt if needed)
            const tool3_id = 'tool-i53f88dd-rerun';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool3_id,
                tool: 'generate_visual',
                status: 'completed',
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                output_ref: simCampaign.outputs[2].id
            });
            simCampaign.state.last_completed_tool = 'generate_visual';
            updateSimulatorUI();
            addLog(`[image_node] 重跑：檢測到修訂為純文字修正，視覺無須重繪，重用 cached outputs。`, 'success');
            await sleep(1000);

            // Node 4: reviewer (re-evaluates new copy)
            const tool4_id = 'tool-r4bb00cc-rerun';
            simCampaign.state.tool_calls.push({
                tool_run_id: tool4_id,
                tool: 'review_outputs',
                status: 'running',
                started_at: new Date().toISOString()
            });
            addLog(`[reviewer_node] 重跑：重新審核已修正的文案與視覺匹配度。`, 'agent');
            updateSimulatorUI();
            await sleep(2000);

            const reviewMetadata = {
                approved: true,
                score: 96,
                suggestions: ['完美對齊！文案非常吸引人且包含了所有反饋表情。'],
                revised_copy: revisedCopy
            };
            simCampaign.outputs[3].content = revisedCopy;
            simCampaign.outputs[3].metadata = reviewMetadata;
            simCampaign.outputs[3].created_at = new Date().toISOString();

            simCampaign.state.tool_calls[3].status = 'completed';
            simCampaign.state.tool_calls[3].completed_at = new Date().toISOString();
            simCampaign.state.tool_calls[3].output_ref = simCampaign.outputs[3].id;
            simCampaign.state.last_completed_tool = 'review_outputs';
            simCampaign.state.review = reviewMetadata;

            simCampaign.status = 'completed'; // Approved!
            addLog(`[reviewer_node] 重跑完成。評分 96 達標 (approved: true)。後端更新 campaigns.status ➔ "completed"`, 'success');
            updateSimulatorUI();
        });
    }

    // Initialize Simulator State
    simCampaign.status = 'uncreated';
    updateSimulatorUI();
});
