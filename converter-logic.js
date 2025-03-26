// 厭世信件轉換器的核心邏輯
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const inputText = document.querySelector('textarea');
    const convertButton = document.querySelector('.convert-button');
    const resultContainer = document.querySelector('.result-container p');
    const moodSlider = document.querySelector('.mood-slider');
    const optionButtons = document.querySelectorAll('.option-button');
    const tabs = document.querySelectorAll('.tab');
    const threadToggle = document.querySelector('.thread-toggle');
    const threadContainer = document.querySelector('.thread-container');
    const addThreadButton = document.querySelector('.add-thread');
    const copyButton = document.querySelector('.copy-button');
    const regenButton = document.querySelector('.regen-button');
    const saveTemplateButton = document.querySelector('.save-template');
    
    // 客製化資訊欄位
    const projectName = document.getElementById('project-name');
    const deadline = document.getElementById('deadline');
    const recipientName = document.getElementById('recipient-name');
    const myTitle = document.getElementById('my-title');
    
    // 定義郵件轉換模板
    const templates = {
        "專業正式": {
            intro: ["感謝您關於{project}的來信。", "{recipient}您好，收到您的郵件，感謝您的意見。", "您好{recipient}，感謝您抽空與我聯繫。"],
            body: ["經過仔細考量，我想表達以下看法：", "關於您提到的事項，我有以下回應：", "針對您的要求，我想提供以下回饋："],
            closing: ["期待您的回覆，謝謝。", "如有任何疑問，請隨時與我聯繫。", "謝謝您的理解與配合。"]
        },
        "委婉拒絕": {
            intro: ["感謝您關於{project}的邀請/提議。", "{recipient}您好，收到您的要求，感謝您的考慮。", "謝謝您對我的信任。"],
            body: ["由於目前工作量較大，恐無法立即回應您在{date}前提出的要求。", "考慮到現有的時程安排，我需要評估是否能配合您的期望。", "基於當前的資源分配，我作為{title}需要審慎考慮您的要求。"],
            closing: ["希望您能理解，謝謝。", "期待未來有機會合作。", "感謝您的體諒。"]
        },
        "友善溝通": {
            intro: ["{recipient}您好！希望您一切安好！", "很高興收到您關於{project}的來信。", "感謝您的關注與回饋。"],
            body: ["我理解您在{date}前的時間考量，並想分享我的看法：", "您關於{project}的建議很有價值，我想進一步討論：", "我很感謝您提出這個觀點，讓我思考後回應："],
            closing: ["期待我們能繼續保持良好的溝通。", "希望我的回應對您有所幫助。", "讓我們一起努力找到最佳解決方案。"]
        },
        "堅定立場": {
            intro: ["感謝您關於{project}的來信。", "{recipient}您好，收到您的郵件，謝謝您的意見。", "謝謝您提出這個議題。"],
            body: ["經過評估，我作為{title}必須表明我的立場是：", "基於專業判斷，我需要堅持以下觀點：", "考量到{date}的截止日期，我的決定是："],
            closing: ["感謝您的理解。", "希望我的立場表達清楚。", "期待您的回覆，謝謝。"]
        },
        "請求支援": {
            intro: ["希望您一切順利，{recipient}。", "冒昧打擾，需要您關於{project}的協助。", "感謝您閱讀此郵件。"],
            body: ["目前我遇到了一些挑戰，希望能得到您的支援：", "由於工作量超出預期，無法在{date}前完成，我需要請求額外資源：", "為了確保{project}的品質，我作為{title}希望能夠："],
            closing: ["感謝您的理解與支持。", "期待您的回覆，謝謝。", "您的協助將不勝感激。"]
        }
    };
    
    // 負面詞彙與專業詞彙的對應表
    const wordMapping = {
        "白癡": ["不合理", "需要重新考慮", "值得商榷"],
        "垃圾": ["品質有待提升", "需要改進", "未達標準"],
        "廢物": ["效率低下", "不夠理想", "需要優化"],
        "爛": ["表現不佳", "有待改進", "需要調整"],
        "煩": ["較為複雜", "需要協調", "需要額外關注"],
        "不想做": ["需要重新評估優先順序", "建議重新分配資源", "需要調整時程"],
        "無聊": ["較為例行", "缺乏挑戰性", "可以優化流程"],
        "浪費時間": ["時間效益不高", "可以更有效利用資源", "需要重新規劃"],
        "滾": ["建議暫緩", "需要重新思考", "請允許我婉拒"],
        "搞笑": ["不切實際", "缺乏可行性", "需要更務實的方案"],
        "懶得": ["需要評估必要性", "建議重新考慮", "可以探討替代方案"],
        "老闆神經病": ["管理方式有待商榷", "領導決策需要討論", "組織方向需要澄清"],
        "加班": ["延長工作時間", "額外工作安排", "工作時間外的commitment"],
        "不可能": ["挑戰較大", "需要創新思維", "需要重新評估可行性"],
        "我就不": ["我建議重新考慮", "我持保留意見", "我需要進一步討論"],
        "臨時需求": ["計劃外的要求", "未在原規劃內的任務", "需要額外評估的增項"]
    };
    
    // 情境詞彙映射
    const contextMapping = {
        "會議": {
            "廢話": "非關鍵信息",
            "拖延": "時間管理有待改善",
            "吹牛": "需要更具體的支持數據",
            "打瞌睡": "注意力難以集中",
            "離題": "未聚焦於議程"
        },
        "請假": {
            "不想上班": "需要調整工作狀態",
            "心情差": "精神狀態需要調整",
            "厭倦": "工作熱情需要恢復",
            "逃離": "需要暫時脫離工作環境",
            "受不了": "承受較大工作壓力"
        }
    };
    
    // 更新情緒指示器
    moodSlider.addEventListener('input', function() {
        document.querySelector('.mood-indicator span:last-child').textContent = getMoodEmoji(this.value);
    });
    
    // 獲取當前選中的風格
    function getSelectedStyle() {
        const selectedButton = document.querySelector('.option-button.option-selected');
        return selectedButton ? selectedButton.textContent : "專業正式";
    }
    
    // 獲取當前選中的標籤頁
    function getSelectedTab() {
        const selectedTab = document.querySelector('.tab.tab-active');
        return selectedTab ? selectedTab.textContent : "郵件轉換";
    }
    
    // 客製化替換模板中的變數
    function customizeTemplate(template) {
        const projectVal = projectName.value || "專案";
        const dateVal = deadline.value ? new Date(deadline.value).toLocaleDateString('zh-TW') : "期限";
        const recipientVal = recipientName.value ? recipientName.value : "";
        const titleVal = myTitle.value || "團隊成員";
        
        return template
            .replace(/\{project\}/g, projectVal)
            .replace(/\{date\}/g, dateVal)
            .replace(/\{recipient\}/g, recipientVal ? recipientVal + " " : "")
            .replace(/\{title\}/g, titleVal);
    }
    
    // 分析信件串內容
    function analyzeEmailThread() {
        const emailBodies = document.querySelectorAll('.email-body');
        if (emailBodies.length === 0) return null;
        
        let threadContext = {
            keywords: [],
            topics: [],
            sentiment: "neutral"
        };
        
        // 常見的負面情緒詞
        const negativeWords = ["緊急", "立即", "盡快", "必須", "要求", "臨時", "加班", "延期", "錯誤", "問題"];
        const positiveWords = ["感謝", "欣賞", "出色", "優秀", "完美", "幫助", "支持", "合作", "理解"];
        
        emailBodies.forEach(email => {
            const content = email.textContent;
            
            // 提取關鍵詞
            const extractedKeywords = [];
            for (const word of [...negativeWords, ...positiveWords]) {
                if (content.includes(word)) {
                    extractedKeywords.push(word);
                    if (negativeWords.includes(word)) {
                        threadContext.sentiment = "negative";
                    } else if (threadContext.sentiment !== "negative" && positiveWords.includes(word)) {
                        threadContext.sentiment = "positive";
                    }
                }
            }
            
            // 提取主題
            if (content.includes("報告") || content.includes("數據")) {
                threadContext.topics.push("報告");
            }
            if (content.includes("客戶") || content.includes("需求")) {
                threadContext.topics.push("客戶需求");
            }
            if (content.includes("功能") || content.includes("開發")) {
                threadContext.topics.push("功能開發");
            }
            if (content.includes("時間") || content.includes("期限") || content.includes("截止")) {
                threadContext.topics.push("時間管理");
            }
            
            threadContext.keywords = [...threadContext.keywords, ...extractedKeywords];
        });
        
        // 去重
        threadContext.keywords = [...new Set(threadContext.keywords)];
        threadContext.topics = [...new Set(threadContext.topics)];
        
        return threadContext;
    }
    
    // 根據信件串上下文增強回覆
    function enhanceWithContext(reply, context) {
        if (!context) return reply;
        
        let enhanced = reply;
        
        // 根據上下文添加相關回應
        if (context.topics.includes("報告")) {
            enhanced += " 關於報告的部分，我會優先處理數據分析和圖表的準備工作。";
        }
        
        if (context.topics.includes("客戶需求") && context.topics.includes("功能開發")) {
            enhanced += " 對於新增的功能需求，我建議我們先評估其優先級及對現有進度的影響，再制定合理的開發計劃。";
        }
        
        if (context.topics.includes("時間管理") && context.sentiment === "negative") {
            enhanced += " 考量到時間限制，我們可能需要討論哪些工作內容可以優先處理，哪些可以適當調整時程。";
        }
        
        return enhanced;
    }
    
    // 轉換情緒程度的函數
    function getMoodEmoji(value) {
        const emojis = ["😊", "😐", "😑", "😤", "😡"];
        return emojis[value - 1];
    }
    
    // 選項按鈕點擊事件
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按鈕的選中狀態
            optionButtons.forEach(btn => btn.classList.remove('option-selected'));
            // 添加選中狀態到當前按鈕
            this.classList.add('option-selected');
        });
    });
    
    // 標籤頁切換
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('tab-active'));
            this.classList.add('tab-active');
            
            // 更新占位符文本
            if (this.textContent === '郵件轉換') {
                inputText.placeholder = "例如：「這是什麼白癡要求，我已經連續加班一週了還要我今天完成？又來臨時需求？搞笑！」";
            } else if (this.textContent === '會議紀錄') {
                inputText.placeholder = "例如：「又是一場無聊的會議，大家都在浪費時間，老闆講的都是廢話。」";
            } else if (this.textContent === '請假申請') {
                inputText.placeholder = "例如：「我真的不想上班了，心情糟透了，需要休息一下。」";
            }
        });
    });
    
    // 信件串顯示/隱藏切換
    threadToggle.addEventListener('click', function() {
        threadContainer.style.display = threadContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // 添加更多信件
    addThreadButton.addEventListener('click', function() {
        const newEmail = document.createElement('div');
        newEmail.className = 'email-message';
        newEmail.innerHTML = `
            <div class="email-header">
                <span class="email-from">寄件者: <input type="text" placeholder="姓名/職稱" size="15"></span>
                <span class="email-time">${new Date().toLocaleString('zh-TW')}</span>
            </div>
            <div class="email-body" contenteditable="true">
                在此輸入郵件內容...
            </div>
            <button class="delete-email" style="float:right;margin-top:5px;color:red;background:none;border:none;cursor:pointer;">刪除</button>
        `;
        
        // 添加刪除郵件的事件監聽
        const deleteButton = newEmail.querySelector('.delete-email');
        deleteButton.addEventListener('click', function() {
            newEmail.remove();
        });
        
        // 插入到添加按鈕前面
        threadContainer.insertBefore(newEmail, addThreadButton);
    });
    
    // 複製到剪貼簿
    copyButton.addEventListener('click', function() {
        const textToCopy = resultContainer.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            // 顯示複製成功提示
            const originalText = this.textContent;
            this.textContent = '已複製！';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        }, (err) => {
            console.error('無法複製文本: ', err);
        });
    });
    
    // 重新生成回覆
    regenButton.addEventListener('click', function() {
        convertText();
    });
    
    // 儲存為範本
    saveTemplateButton.addEventListener('click', function() {
        const templateName = prompt('請為此範本命名:');
        if (templateName) {
            // 獲取現有範本或初始化新的範本數組
            const savedTemplates = JSON.parse(localStorage.getItem('emailTemplates')) || [];
            
            // 添加新範本
            savedTemplates.push({
                name: templateName,
                content: resultContainer.textContent,
                createdAt: new Date().toISOString()
            });
            
            // 保存到本地存儲
            localStorage.setItem('emailTemplates', JSON.stringify(savedTemplates));
            
            alert(`範本「${templateName}」已儲存！`);
        }
    });
    
    // 轉換文本的主函數
    function convertText() {
        const input = inputText.value;
        if (!input.trim()) {
            alert('請輸入需要轉換的內容');
            return;
        }
        
        // 獲取當前選中的風格
        const style = getSelectedStyle();
        
        // 獲取當前選中的標籤頁類型
        const tabType = getSelectedTab();
        
        // 獲取情緒級別
        const moodLevel = parseInt(moodSlider.value);
        
        // 分析信件串上下文
        const threadContext = analyzeEmailThread();
        
        // 替換負面詞彙為專業詞彙
        let processedText = input;
        for (const [negative, professional] of Object.entries(wordMapping)) {
            // 根據情緒程度選擇不同程度的專業詞彙
            const professionalIndex = Math.min(Math.floor(moodLevel / 2), professional.length - 1);
            const replacement = professional[professionalIndex];
            
            // 使用正則表達式進行全局替換，忽略大小寫
            const regex = new RegExp(negative, 'gi');
            processedText = processedText.replace(regex, replacement);
        }
        
        // 如果是會議紀錄或請假申請，使用對應的情境詞彙映射
        if (tabType === '會議紀錄' || tabType === '請假申請') {
            const contextMap = contextMapping[tabType === '會議紀錄' ? '會議' : '請假'];
            for (const [negative, professional] of Object.entries(contextMap)) {
                const regex = new RegExp(negative, 'gi');
                processedText = processedText.replace(regex, professional);
            }
        }
        
        // 根據選擇的風格生成回覆
        const template = templates[style];
        const introIndex = Math.floor(Math.random() * template.intro.length);
        const bodyIndex = Math.floor(Math.random() * template.body.length);
        const closingIndex = Math.floor(Math.random() * template.closing.length);
        
        let reply = customizeTemplate(template.intro[introIndex]) + " ";
        
        // 根據不同風格處理正文部分
        if (style === "委婉拒絕") {
            reply += customizeTemplate(template.body[bodyIndex]) + " " + processedText + " ";
        } else if (style === "堅定立場") {
            reply += customizeTemplate(template.body[bodyIndex]) + " 我無法接受" + processedText + " ";
        } else {
            reply += customizeTemplate(template.body[bodyIndex]) + " " + processedText + " ";
        }
        
        reply += customizeTemplate(template.closing[closingIndex]);
        
        // 如果有信件串上下文，增強回覆
        if (threadContext) {
            reply = enhanceWithContext(reply, threadContext);
        }
        
        // 根據標籤頁類型調整輸出格式
        if (tabType === '會議紀錄') {
            // 格式化為會議紀錄
            const today = new Date().toLocaleDateString('zh-TW');
            reply = `會議紀錄 - ${today}\n\n會議主題：${projectName.value || '團隊例會'}\n\n與會人員：${recipientName.value || '團隊成員'}\n\n會議內容：\n${reply}\n\n記錄人：${myTitle.value || '我'}`;
        } else if (tabType === '請假申請') {
            // 格式化為請假申請
            reply = `請假申請\n\n申請人：${myTitle.value || '我'}\n\n請假日期：${deadline.value ? new Date(deadline.value).toLocaleDateString('zh-TW') : '待定'}\n\n請假原因：\n${reply}`;
        }
        
        // 更新結果
        resultContainer.textContent = reply;
    }
    
    // 轉換按鈕點擊事件
    convertButton.addEventListener('click', convertText);
    
    // 初始化頁面設置
    function initializePage() {
        // 設置默認日期為明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deadline.valueAsDate = tomorrow;
        
        // 設置默認項目名
        projectName.value = "專案報告";
        
        // 設置默認表單值
        myTitle.value = "專案成員";
        
        // 初始化信件串顯示狀態
        threadContainer.style.display = 'block';
        
        // 初始化情緒指示器
        document.querySelector('.mood-indicator span:last-child').textContent = getMoodEmoji(3);
    }
    
    // 頁面加載後初始化
    initializePage();
});toLocale