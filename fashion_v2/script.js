// 全局变量存储时尚搭配数据
let fashionData = [];

// 等待DOM加載完成
document.addEventListener('DOMContentLoaded', async () => {
    // 加載時尚搭配數據
    await loadFashionData();

    // 初始化P5.js背景
    initP5Background();

    // 初始化深色/淺色模式
    initThemeToggle();

    // 初始化檔案上傳功能
    initFileUpload();

    // 初始化模態框功能
    initModal();

    // 初始化示例圖片
    initDemoImage();

    // 初始化頁面
    initPage();
});

// 加載時尚搭配數據
async function loadFashionData() {
    try {
        const response = await fetch('fashion.json');
        fashionData = await response.json();
        console.log('成功載入時尚搭配數據');
    } catch (error) {
        console.error('載入時尚搭配數據失敗:', error);
    }
}

// 獲取隨機穿搭建議
function getRandomFashionSuggestion() {
    if (fashionData.length === 0) return null;
    return fashionData[Math.floor(Math.random() * fashionData.length)];
}

// 更新穿搭建議區域
function updateFashionSuggestion() {
    const suggestion = getRandomFashionSuggestion();
    if (!suggestion) return;

    // 更新AI建議區域
    const aiSuggestionSection = document.querySelector('#ai-suggestion-section');
    if (aiSuggestionSection) {
        // 更新標題
        const titleElement = aiSuggestionSection.querySelector('h3');
        if (titleElement) {
            titleElement.textContent = `最佳穿搭選擇：${suggestion.style}`;
        }

        // 更新圖片
        const outfitImage = aiSuggestionSection.querySelector('#ai-outfit-image');
        if (outfitImage) {
            outfitImage.src = suggestion.image;
            outfitImage.alt = suggestion.style;
        }

        // 更新穿搭單品格子
        const gridContainer = aiSuggestionSection.querySelector('.grid-cols-2.md\\:grid-cols-3');
        if (gridContainer) {
            gridContainer.innerHTML = '';

            // 添加所有服裝項目
            Object.entries(suggestion.outfit).forEach(([key, value]) => {
                if (value !== "無") {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'bg-gray-100 dark:bg-gray-700 p-2 rounded-lg';

                    // 根據不同類型顯示不同文字
                    let text = '';
                    switch (key) {
                        case 'top':
                            text = '上衣';
                            break;
                        case 'bottom':
                        case 'skirt':
                            text = '下身';
                            break;
                        case 'outer':
                            text = '外套';
                            break;
                        case 'shoes':
                            text = '鞋子';
                            break;
                        case 'accessory1':
                        case 'accessory2':
                            text = '配件';
                            break;
                        default:
                            text = '配件';
                    }

                    itemDiv.innerHTML = `
                        <div class="w-full h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                            <span class="text-xs text-gray-600 dark:text-gray-400">${text}</span>
                        </div>
                        <p class="text-sm text-center mt-1 bg-gray-200 dark:bg-gray-600 p-2 rounded">${value}</p>
                    `;
                    gridContainer.appendChild(itemDiv);
                }
            });
        }

        // 更新穿搭要點
        const tipsList = aiSuggestionSection.querySelector('ul');
        if (tipsList) {
            tipsList.innerHTML = suggestion.wearTips.map(tip =>
                `<li class="mb-2">${tip}</li>`
            ).join('');
        }
    }
}

// 顯示AI建議
function showAISuggestion() {
    const scoreSection = document.getElementById('score-section');
    const aiSuggestionSection = document.getElementById('ai-suggestion-section');

    if (scoreSection && aiSuggestionSection) {
        // 隱藏評分區域，顯示AI建議區域
        scoreSection.classList.add('hidden');
        aiSuggestionSection.classList.remove('hidden');
        updateFashionSuggestion();
    }
}

// P5.js 背景動畫
function initP5Background() {
    new p5(sketch, 'p5-container');
}

// P5.js 動畫設計
function sketch(p) {
    let particles = [];
    const particleCount = 50;
    let isDark = document.documentElement.classList.contains('dark');

    p.setup = function () {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('display', 'block');
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    };

    p.draw = function () {
        isDark = document.documentElement.classList.contains('dark');
        p.clear();

        particles.forEach(particle => {
            updateParticle(particle);
            displayParticle(particle);
        });
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // 互動功能：滑鼠移動時粒子會被吸引
    p.mouseMoved = function () {
        particles.forEach(particle => {
            const d = p.dist(p.mouseX, p.mouseY, particle.x, particle.y);
            if (d < 150) {
                const angle = p.atan2(p.mouseY - particle.y, p.mouseX - particle.x);
                const force = p.map(d, 0, 150, 0.5, 0.1);
                particle.vx += p.cos(angle) * force;
                particle.vy += p.sin(angle) * force;
            }
        });
    };

    function createParticle() {
        return {
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(3, 8),
            vx: p.random(-1, 1),
            vy: p.random(-1, 1),
            ax: 0,
            ay: 0,
            alpha: p.random(30, 100),
            // 添加粒子的独特属性
            wanderTheta: p.random(p.TWO_PI),
            wanderRadius: 0.5,
            maxSpeed: p.random(0.5, 2),
            maxForce: 0.1
        };
    }

    function updateParticle(particle) {
        // 添加随机游走行为
        particle.wanderTheta += p.random(-0.1, 0.1);
        const wanderX = particle.wanderRadius * p.cos(particle.wanderTheta);
        const wanderY = particle.wanderRadius * p.sin(particle.wanderTheta);

        // 应用力
        particle.ax = wanderX;
        particle.ay = wanderY;

        // 更新速度
        particle.vx += particle.ax;
        particle.vy += particle.ay;

        // 限制速度
        const speed = p.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > particle.maxSpeed) {
            particle.vx = (particle.vx / speed) * particle.maxSpeed;
            particle.vy = (particle.vy / speed) * particle.maxSpeed;
        }

        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检查（让粒子从另一边出现）
        if (particle.x < -50) particle.x = p.width + 50;
        if (particle.x > p.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = p.height + 50;
        if (particle.y > p.height + 50) particle.y = -50;

        // 缓慢减速（添加一些阻力）
        particle.vx *= 0.99;
        particle.vy *= 0.99;
    }

    function displayParticle(particle) {
        const baseColor = isDark ? [51, 119, 207] : [0, 85, 195];
        p.noStroke();
        // 添加渐变效果
        const glowSize = particle.size * 2;
        const gradient = p.drawingContext.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowSize
        );
        gradient.addColorStop(0, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${particle.alpha / 255})`);
        gradient.addColorStop(1, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0)`);

        p.drawingContext.fillStyle = gradient;
        p.circle(particle.x, particle.y, glowSize * 2);
    }
}

// 深色/淺色模式切換
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // 檢查元素是否存在
    if (!themeToggle) {
        console.error('找不到 theme-toggle 元素');
        return;
    }

    // 從 localStorage 中獲取保存的主題
    const savedTheme = localStorage.getItem('theme');

    // 根據保存的主題或系統偏好設置初始主題
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        html.classList.add('dark');
        html.classList.remove('light');
    } else {
        html.classList.add('light');
        html.classList.remove('dark');
    }

    // 設置切換按鈕的圖標
    updateThemeIcon();

    // 監聽系統主題變化
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                html.classList.add('dark');
                html.classList.remove('light');
            } else {
                html.classList.add('light');
                html.classList.remove('dark');
            }
            updateThemeIcon();
        }
    });

    // 點擊切換主題
    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            html.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.remove('light');
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
        console.log('切換主題', html.classList.contains('dark') ? '深色' : '淺色');
    });

    // 更新主題圖標
    function updateThemeIcon() {
        const isDark = html.classList.contains('dark');
        themeToggle.innerHTML = isDark ?
            '<i class="fas fa-sun text-yellow-300"></i>' :
            '<i class="fas fa-moon text-primary-600"></i>';
    }
}

// 檔案上傳功能
function initFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const uploadContainer = document.querySelector('.upload-container');
    const uploadSection = document.getElementById('upload-section');
    const scoreSection = document.getElementById('score-section');
    const userImage = document.getElementById('user-image');

    if (!fileUpload || !uploadContainer) return;

    // 定義多樣化的評分結果
    const scoreResults = [{
            score: "10.0",
            level: "宇宙級穿搭天神",
            analysis: "你這不是穿搭，是時尚奇蹟重現。整體比例、配色、風格融合得天衣無縫，簡直像是行走的高訂目錄。你不只贏過所有街拍，更讓時尚雜誌都顯得老土，甚至連不懂穿搭的路人都能感受到你的神聖光芒。",
            suggestion: "你應該開班授課，或乾脆出一本穿搭聖經。別只把這份品味藏在日常裡，分享出來讓大家活下去有個目標。但也別太驕傲，畢竟太強會被嫉妒，建議留一點空間讓凡人喘氣。"
        },
        {
            score: "9.5",
            level: "穿搭界影帝影后",
            analysis: "你根本是穿搭界的藝術導演，從選品到整體造型都有令人驚嘆的掌控力。配色精準，比例俐落，每個細節都藏著對風格的理解與自信。你不是在搭衣服，是在講一段能被收藏的時尚故事。",
            suggestion: "你的風格已經強大得讓人忍不住側目，接下來該挑戰的是出奇不意的混搭路線。別再只是完美，來點怪、點瘋，讓你從大師升級成傳奇。當然也別忘了拉人一把，別讓朋友們成為你的陪襯。"
        },
        {
            score: "9.0",
            level: "走路有風本人",
            analysis: "你顯然知道自己在幹嘛。整體搭配非常成熟穩定，每件單品彼此相愛，細節藏著巧思，風格也不會過於安全，讓人感受到你有在認真思考每一個選擇。街拍攝影師看到你應該會立刻舉起鏡頭。",
            suggestion: "你已經從普通人脫穎而出，是時候再多一點創意冒險。挑戰冷門風格、搞點剪裁實驗、顛覆一下配件，讓你的穿搭有驚喜的爆點。你有底子，現在就差一點瘋狂來成為全場最不可複製的存在。"
        },
        {
            score: "8.5",
            level: "半熟時尚煎蛋",
            analysis: "你不是在跟流行走，而是走在自己的小宇宙裡。這套穿搭非常有辨識度，透露出你對風格的掌握力，也有嘗試突破框架的野心。雖然有些搭配可能還稍嫌冒險，但看得出你正在摸索自己的風格疆界。",
            suggestion: "建議你在創意與實穿之間多練習平衡。有時候你距離炸場只有一步，但那一步可能是踩雷。別忘了風格不是亂堆單品，而是要駕馭。保持實驗精神，但請適度控場，不要讓衣服看起來比你還有主見。"
        },
        {
            score: "8.0",
            level: "時尚界實習生",
            analysis: "你在穿搭這條路上明顯有用心，整體造型已經有了方向，但仍欠缺一點精緻與收斂。風格雖然明確，但偶爾還是有種「快要很強」卻少一點打磨的感覺。小細節常常拉低整體質感，稍嫌可惜。",
            suggestion: "你需要的是「最後一步的審美判斷力」。可能是一雙鞋、也可能是一條腰帶毀了你的努力。記住，不是東西好就能放上身，整體協調性才是關鍵。別急著炫技，簡單有時反而會更突出你的風格。"
        },
        {
            score: "7.5",
            level: "時尚邊緣觀察員",
            analysis: "這套穿搭看得出你努力過，至少不是亂穿，但仍然停留在「知道自己喜歡什麼」的階段。風格不太統一，像是你早上五分鐘內挑的單品彼此沒開會就上場了。感覺還不夠果敢、不夠狠，還在試探時尚的邊界。",
            suggestion: "開始從頭到腳做整體搭配計畫，而不是每天靠靈機一動或心情。請為衣櫃建立基本邏輯，比如：什麼風格是你、什麼元素該淘汰。你不是不會穿，而是還沒真正建立審美自信。衣服選你，不如你選衣服。"
        },
        {
            score: "7.0",
            level: "正在加熱中穿搭便當",
            analysis: "你有在搭，但好像還停留在「顏色差不多就能出門」的階段。整體看起來沒出錯，但也沒驚喜。風格過於安全，有點像是你打算去超商買牛奶卻被迫參加時尚快閃活動的樣子。",
            suggestion: "不要再只靠白T＋牛仔褲撐場面，你值得更多元。多研究版型、鞋款與配件的搭配方式，才能真正走出風格。不要怕出錯，畢竟你現在看起來就是沒試過任何風格，別當低調的懶惰代言人。"
        },
        {
            score: "6.5",
            level: "穿搭界路人甲",
            analysis: "這穿搭像是在模仿時尚卻沒帶腦。單品雖然彼此不打架，但也完全沒互動，整體就像一齣沒有劇本的舞台劇，看完只剩尷尬與空虛。你有想努力，可惜還沒找到正確方法，離好看還差一大段。",
            suggestion: "請立刻開始建立自己的穿衣價值觀，不是看喜歡什麼就往身上堆。不是潮就適合你，也不是舒服就能無腦亂搭。先學會什麼叫做風格一致，然後才有資格玩混搭。不然你永遠只是很努力的布料搬運工。"
        },
        {
            score: "6.0",
            level: "衣櫃被詛咒的人",
            analysis: "你可能以為這套還行，其實它剛好卡在『不上不下』的尷尬地帶。沒大錯，但也沒記憶點。看起來像你被衣櫃打了一架，衣服選你不是你選衣服，全身散發一種「我今天真的沒空管穿搭」的能量。",
            suggestion: "從現在開始，每次穿衣服前請問自己：我真的需要這條褲子出現在今天的故事裡嗎？學會說不，比亂搭還重要。別再當自己衣櫃的奴隸，好嗎？你可以更有主導權，只要你願意開始動點腦。"
        },
        {
            score: "5.5",
            level: "視覺疲勞創造者",
            analysis: "你身上那一堆東西真的太努力在說話了，每件單品都想當主角，結果全員搶戲翻車。看起來像你連續參加五個不同主題派對，但懶得換衣服所以一次穿完。整體只剩一個詞：混亂。",
            suggestion: "拜託先統一一下風格好嗎？別再把復古、運動、可愛、Y2K全部堆在一起。穿搭不是火鍋料，不是什麼都丟進去就叫有料。少一點混亂，多一點控制力，你才能讓人眼睛亮，不是眼睛痛。"
        },
        {
            score: "5.0",
            level: "穿搭界的CPU過熱",
            analysis: "你這套看起來像早上5分鐘內開機失敗的產物。配件亂、版型亂、顏色亂，就像你試圖用隨機演算法產出造型結果，但不幸抽到Bug版。雖然感受到想嘗試的心意，但也只感受到滿滿的誤會。",
            suggestion: "請開始培養風格濾鏡，不是東西買得多就是會搭。你需要的是一個能說『NO』的腦袋，而不是不停把東西往身上套。與其當個過度處理的布料資料夾，不如從基礎款練起，讓每件衣服為你說話。"
        },
        {
            score: "4.5",
            level: "時尚意外現場目擊者",
            analysis: "這看起來不像穿搭，更像時尚交通事故。每一件單品都在自己跑劇本，顏色在吵架，鞋子想走，帽子想飛，整體就是「我還沒準備好」的真人實境秀。這不是造型，是混亂的藝術。",
            suggestion: "請先停下來，深呼吸，把你的衣櫃照個相。你需要清倉，也需要重建。從顏色開始學、從剪裁開始懂，別再讓每次出門都變成穿搭版的地震預警。穩定，是你目前最該追求的兩個字。"
        },
        {
            score: "4.0",
            level: "時尚保全室誤闖者",
            analysis: "看起來像你不小心闖進了時尚大樓的後門，還被誤會是搞怪藝術家。這些衣服應該沒討論過就被你硬湊上身，搭起來像開會遲到沒PPT還要硬講十分鐘。整體讓人懷疑你有沒有照鏡子出門。",
            suggestion: "請先學會「穿得乾淨」，不要再靠怪來掩飾不會搭。風格不是亂，是設計過的亂；不是多，是精緻的多。現在的你只是一團堆疊，希望你開始學會刪減，讓大家對你產生『啊，這人懂穿』的幻想。"
        },
        {
            score: "3.5",
            level: "時尚界的危險駕駛",
            analysis: "這不是穿搭，是意圖使人視覺毀滅。看起來像你對著衣櫃喊『誰想被穿今天就站出來』，然後它們全部同時報名。每件單品都在吶喊，結果整體成了雜訊。你不只是路人，是路障。",
            suggestion: "馬上停止風格實驗。你不是不特別，是太過分。開始學習什麼是基本搭配、什麼是統一調性，先會走路再挑戰跑百米。現在你連站都不穩，時尚考照請從筆試重新報名，拜託，別再衝了。"
        },
        {
            score: "3.0",
            level: "穿搭界的心靈風水師",
            analysis: "你穿這樣出門應該要先點香驅邪，因為看起來真的很像中邪。這些元素毫無章法地撞在一起，連路人都想幫你重組造型。就算你有想法，它們也全死在執行力上。這是時尚界的靈異事件現場。",
            suggestion: "先別談風格，請你從洗衣分類開始學起。學會哪些布料能同框，哪些版型會互毀。穿搭不是靈異召喚術，不是把你喜歡的都穿上就叫有風格。現在的你像一套尚未驅魔完成的儀式裝備，慎用。"
        },
        {
            score: "2.0",
            level: "時尚終結者",
            analysis: "這不是穿搭，是時尚系統的強制重開機。你像是選擇障礙者的終極形態，把所有元素塞在身上卻沒有一個成立。風格消失、主題崩壞，穿這樣出門完全像你對世界說：我不想被拍照也不想交朋友。",
            suggestion: "建議你把整個衣櫃歸零，像新手一樣重練。你不缺衣服，你缺的是基本邏輯。寧願一天穿一樣的黑白配，也好過每天出門像是參加不明活動的領隊。時尚不是反社會行為，請重新做人。"
        },
        {
            score: "1.0",
            level: "地獄穿搭畢業生",
            analysis: "你身上的每一件東西都在吶喊：「我被強迫參加這場時尚秀！」色調崩潰、版型歪斜、配件像來自平行宇宙。你這不是造型，是概念藝術，只不過沒人看得懂。你甚至成功讓朋友開始懷疑友情價值。",
            suggestion: "請立即封印衣櫃，並從基礎白襯衫開始重新啟動。去觀察會穿的人怎麼搭，怎麼走，再開始模仿。你現在不是沒風格，而是風格崩塌成廢墟。你需要重建人生造型邏輯，徹底大掃除你的審美。"
        },
        {
            score: "0.0",
            level: "時尚毀滅性災害",
            analysis: "你的穿搭已經不是個人選擇，而是一場集體審美浩劫。這套不是outfit，是警示標語。整體像一場過期造型品的大亂鬥，沒有重點、沒有邏輯，讓人懷疑你是不是把整棟UNIQLO炸了才走出來。",
            suggestion: "現在唯一的建議是：別再這樣穿出門。時尚圈對你來說不是夢，是需要被驅魔的空間。從基本款開始，重新學習比例與材質。給彼此一點機會，也給社會一點視覺安全，拜託了。"
        }
    ];

    fileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 顯示用戶上傳的圖片
        if (userImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                userImage.src = e.target.result;
                userImage.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        // 顯示 loading 動畫
        const loadingModal = showLoadingModal('analyze');

        // 處理文件上傳邏輯...
        // 模擬API調用延遲
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 隱藏 loading 動畫
        hideLoadingModal(loadingModal);

        // 隱藏上傳區域，顯示評分區域
        uploadSection.classList.add('hidden');
        scoreSection.classList.remove('hidden');

        // 隨機選擇一個評分結果
        const randomResult = scoreResults[Math.floor(Math.random() * scoreResults.length)];

        // 更新評分和建議
        document.getElementById('style-score').textContent = randomResult.score;
        document.getElementById('style-level').textContent = randomResult.level;
        document.getElementById('style-analysis').textContent = randomResult.analysis;
        document.getElementById('style-suggestion').textContent = randomResult.suggestion;
    });

    // 拖放功能
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('border-primary-500');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('border-primary-500');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('border-primary-500');
        const file = e.dataTransfer.files[0];
        if (file) {
            fileUpload.files = e.dataTransfer.files;
            fileUpload.dispatchEvent(new Event('change'));
        }
    });
}

// 添加loading模態框功能
function showLoadingModal(type = 'analyze') {
    // 創建loading模態框
    const loadingModal = document.createElement('div');
    loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    
    // 根據不同類型顯示不同的文字
    const loadingText = type === 'analyze' ? '分析中，請稍候...' : '儲存中，請稍候...';
    
    loadingModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p class="text-lg font-medium">${loadingText}</p>
        </div>
    `;
    document.body.appendChild(loadingModal);
    return loadingModal;
}

// 隱藏loading模態框
function hideLoadingModal(loadingModal) {
    if (loadingModal && loadingModal.parentNode) {
        loadingModal.parentNode.removeChild(loadingModal);
    }
}

// 使用 Claude API 分析穿搭圖像
async function analyzeImageWithClaude(imageFile) {
    // 將圖像轉換為 base64 格式
    const base64Image = await fileToBase64(imageFile);

    // Claude API 請求配置
    const API_KEY = 'YOUR_CLAUDE_API_KEY'; // 需要替換為實際的 API 密鑰
    const API_URL = 'https://api.anthropic.com/v1/messages';

    // 準備請求內容
    const requestBody = {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{
            role: "user",
            content: [{
                    type: "text",
                    text: "請分析這張穿搭照片，並給出以下信息：\n1. 穿搭評分（1-5分）\n2. 簡短的評價標題\n3. 詳細的穿搭分析\n4. 穿搭建議\n\n請以JSON格式返回，包含以下字段：score, title, analysis, suggestion。"
                },
                {
                    type: "image",
                    source: {
                        type: "base64",
                        media_type: imageFile.type,
                        data: base64Image.split(',')[1] // 移除 data:image/jpeg;base64, 前綴
                    }
                }
            ]
        }]
    };

    // 發送請求到 Claude API
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Claude API 請求失敗: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    // 從回應中提取 JSON 字符串並解析
    try {
        const contentText = responseData.content[0].text;
        // 從文本中提取 JSON 部分（找到 { 開始到 } 結束的部分）
        const jsonMatch = contentText.match(/\{[^]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            // 如果無法找到 JSON，創建一個默認結果
            return {
                score: (Math.random() * 3 + 1.5).toFixed(1),
                title: "時尚探索者",
                analysis: "Claude 無法完全分析您的穿搭，但您的風格顯示了個人特色。",
                suggestion: "嘗試更多色彩搭配和材質組合，發掘更適合您的風格。"
            };
        }
    } catch (error) {
        console.error("解析 Claude 回應時出錯:", error);
        throw error;
    }
}

// 將檔案轉換為 base64 格式
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 顯示結果模態框
function showResultModal(imageSrc, analysisResult) {
    const resultModal = document.getElementById('result-modal');
    const resultContent = document.getElementById('result-content');

    // 使用 Claude 分析結果
    const score = analysisResult.score;
    const scoreTitle = analysisResult.title;
    const scoreAnalysis = analysisResult.analysis;
    const suggestion = analysisResult.suggestion;

    // 填充結果內容
    resultContent.innerHTML = `
        <div class="md:flex">
            <div class="md:w-1/2 mb-4 md:mb-0">
                <img src="${imageSrc}" alt="上傳的穿搭照片" class="w-full h-auto rounded-lg">
            </div>
            <div class="md:w-1/2 md:pl-6">
                <div class="flex items-center mb-4">
                    <span class="text-2xl font-bold mr-2">穿搭評分:</span>
                    <span class="text-3xl font-bold text-indigo-600">${score}</span>
                    <span class="ml-2 text-sm text-gray-500">${scoreTitle}</span>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-bold mb-2">評價分析</h4>
                    <p class="text-gray-600 dark:text-gray-400">${scoreAnalysis}</p>
                </div>
                
                <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <h4 class="font-bold mb-2 text-indigo-700 dark:text-indigo-300">穿搭建議</h4>
                    <p class="text-gray-700 dark:text-gray-300">${suggestion}</p>
                </div>
                
                <div class="mt-6">
                    <button id="show-ai-suggestion" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-lightbulb mr-2"></i>查看AI穿搭建議
                    </button>
                </div>
            </div>
        </div>
    `;

    // 註冊查看建議按鈕事件
    const suggestButton = resultModal.querySelector('#show-ai-suggestion');
    suggestButton.addEventListener('click', async () => {
        suggestButton.disabled = true;
        suggestButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        try {
            await showAISuggestion(analysisResult);
        } finally {
            suggestButton.disabled = false;
            suggestButton.innerHTML = '<i class="fas fa-lightbulb mr-2"></i>查看AI穿搭建議';
        }
    });

    // 顯示模態框
    resultModal.classList.remove('hidden');

    // 注冊關閉按鈕事件
    document.getElementById('close-modal').addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // 點擊模態框外部關閉
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.classList.add('hidden');
        }
    });
}

// 初始化模態框功能
function initModal() {
    const closeModal = document.getElementById('close-modal');
    const resultModal = document.getElementById('result-modal');
    const shareResult = document.getElementById('share-result');
    const saveResult = document.getElementById('save-result');

    // 檢查元素是否存在
    if (!resultModal) {
        console.warn('找不到結果模態框元素');
        return;
    }

    // 分享功能
    if (shareResult) {
        shareResult.addEventListener('click', () => {
            alert('分享功能將在此處實現，可以分享到 IG/Threads 等社交媒體');
        });
    }

    // 儲存圖片功能
    if (saveResult) {
        saveResult.addEventListener('click', () => {
            alert('這裡將實現將分析結果儲存為圖片的功能');
        });
    }
}

// 初始化示例圖片
function initDemoImage() {
    const demoImage = document.getElementById('demo-image');

    // 實際應用中，這裡會使用真實的穿搭圖片
    // 為了演示，我們保留了placeholder
}

// 初始化頁面
function initPage() {
    // 獲取元素引用
    const uploadSection = document.getElementById('upload-section');
    const scoreSection = document.getElementById('score-section');
    const aiSuggestionSection = document.getElementById('ai-suggestion-section');
    const showAiSuggestionBtn = document.getElementById('show-ai-suggestion');
    const startOverBtn = document.getElementById('start-over');
    const saveSuggestionBtn = document.getElementById('save-suggestion');

    // 檢查元素是否存在
    if (!uploadSection || !scoreSection || !aiSuggestionSection) {
        console.error('找不到主要頁面區塊元素');
        return;
    }

    // 初始化頁面狀態
    uploadSection.classList.remove('hidden');
    scoreSection.classList.add('hidden');
    aiSuggestionSection.classList.add('hidden');

    // 註冊查看AI建議按鈕事件
    if (showAiSuggestionBtn) {
        showAiSuggestionBtn.addEventListener('click', showAISuggestion);
    }

    // 註冊再來一次按鈕事件
    if (startOverBtn) {
        startOverBtn.addEventListener('click', startOver);
    }

    // 註冊儲存建議按鈕事件
    if (saveSuggestionBtn) {
        saveSuggestionBtn.addEventListener('click', saveSuggestionAsImage);
    }

    // 初始化刷新建議按鈕
    const refreshButton = document.getElementById('refresh-suggestion');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            updateFashionSuggestion();
        });
    }
}

// 重新開始
function startOver() {
    const uploadSection = document.getElementById('upload-section');
    const scoreSection = document.getElementById('score-section');
    const aiSuggestionSection = document.getElementById('ai-suggestion-section');
    const fileUpload = document.getElementById('file-upload');
    const userImage = document.getElementById('user-image');

    // 重置文件上傳
    if (fileUpload) {
        fileUpload.value = '';
    }

    // 重置用戶圖片
    if (userImage) {
        userImage.src = '';
        userImage.classList.add('hidden');
    }

    // 顯示上傳區域，隱藏其他區域
    uploadSection.classList.remove('hidden');
    scoreSection.classList.add('hidden');
    aiSuggestionSection.classList.add('hidden');

    // 重置評分和建議內容
    document.getElementById('style-score').textContent = '';
    document.getElementById('style-level').textContent = '';
    document.getElementById('style-analysis').textContent = '';
    document.getElementById('style-suggestion').textContent = '';
}

// 儲存穿搭建議為圖片
async function saveSuggestionAsImage() {
    const suggestionSection = document.getElementById('ai-suggestion-section');
    if (!suggestionSection) return;

    try {
        // 顯示 loading 動畫
        const loadingModal = showLoadingModal('save');

        // 創建一個新的 div 來包含要保存的內容
        const contentToSave = document.createElement('div');
        contentToSave.className = 'bg-white dark:bg-gray-800 p-6 rounded-xl';
        
        // 複製標題
        const title = suggestionSection.querySelector('h3').cloneNode(true);
        contentToSave.appendChild(title);
        
        // 複製圖片
        const image = suggestionSection.querySelector('#ai-outfit-image').cloneNode(true);
        contentToSave.appendChild(image);
        
        // 複製穿搭單品網格
        const grid = suggestionSection.querySelector('.grid-cols-2.md\\:grid-cols-3').cloneNode(true);
        contentToSave.appendChild(grid);
        
        // 複製穿搭要點
        const tips = suggestionSection.querySelector('ul').cloneNode(true);
        contentToSave.appendChild(tips);

        // 將內容添加到 body 中（臨時）
        document.body.appendChild(contentToSave);

        // 使用 html2canvas 將內容轉換為圖片
        const canvas = await html2canvas(contentToSave, {
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            scale: 2, // 提高圖片質量
            logging: false,
            useCORS: true, // 允許跨域圖片
            allowTaint: true // 允許跨域圖片
        });

        // 移除臨時元素
        document.body.removeChild(contentToSave);

        // 隱藏 loading 動畫
        hideLoadingModal(loadingModal);

        // 創建下載連結
        const link = document.createElement('a');
        link.download = '穿搭建議.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('儲存圖片時出錯:', error);
        alert('儲存圖片失敗，請稍後再試');
    }
}