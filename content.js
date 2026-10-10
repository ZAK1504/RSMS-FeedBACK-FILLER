// Checks if the extension is turned ON
function checkAndRun() {
    chrome.storage.local.get(['isActive'], function(result) {
        if (result.isActive) {
            runLogic();
        } else {
            // Remove any banners if it is turned OFF
            const banner = document.getElementById('rsms-banner');
            if (banner) banner.remove();
        }
    });
}

// Runs when you click "START" in the extension popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "run") {
        checkAndRun();
    }
});

// Main execution logic
function runLogic() {
    const url = window.location.href;
    
    // 0. COURSE SUBJECT SELECTION PAGE (The one with the GO >> button)
    const subjectDropdown = document.querySelector('select[name="Subject"]');
    const goBtn = Array.from(document.querySelectorAll('input[type="submit"]')).find(btn => btn.value.includes('GO'));
    
    if (subjectDropdown && goBtn) {
        if (subjectDropdown.options.length > 0) {
            if (!document.getElementById('rsms-banner')) {
                const banner = document.createElement('div');
                banner.id = 'rsms-banner';
                banner.innerText = '🤖 RUNNING... Starting next subject in 1 second.';
                banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#28a745; color:white; text-align:center; padding:10px; z-index:999999; font-weight:bold; font-size:18px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);';
                document.body.appendChild(banner);
            }
            // Auto click GO after 1.5 seconds
            setTimeout(() => goBtn.click(), 1500); 
            return;
        } else {
            // If the dropdown is empty, they are done! Turn it off automatically.
            chrome.storage.local.set({isActive: false});
            alert("All Course Feedbacks are complete!");
            return;
        }
    }
    
    // 1. COURSE FEEDBACK (Exam_Reg.asp) - Fully Automatic Loop
    if (url.includes("Exam_Reg.asp") || document.querySelector('input[name="Ans"]')) {
        handleCourseFeedback();
    } 
    // 2. MID / END SEMESTER FEEDBACK
    else {
        // If there are radio buttons, fill them and submit immediately
        const hasRadios = document.querySelectorAll('input[type="radio"]').length > 0;
        if (hasRadios) {
            fillAllRadios();
            setTimeout(() => {
                const submitBtn = document.querySelector('input[type="submit"], button[type="submit"]');
                if (submitBtn) submitBtn.click();
                else {
                    const form = document.querySelector('form');
                    if (form) form.submit();
                }
            }, 800); // 0.8s delay before submitting so you can see it happen
        }
    }
}

function handleCourseFeedback() {
    // Add banner
    if (!document.getElementById('rsms-banner')) {
        const banner = document.createElement('div');
        banner.id = 'rsms-banner';
        banner.innerText = '🤖 Extension is RUNNING... Waiting for timer.';
        banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#28a745; color:white; text-align:center; padding:10px; z-index:999999; font-weight:bold; font-size:18px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);';
        document.body.appendChild(banner);
    }

    // Check "Excellent" (Value 5)
    const radio = document.querySelector('input[type="radio"][value="5"]') || 
                  document.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }

    // Submit after timer
    const btn = document.querySelector('input[name="B1"][type="submit"]');
    if (btn) {
        setTimeout(() => {
            const banner = document.getElementById('rsms-banner');
            if(banner) banner.innerText = '🤖 Moving to next question...';
            btn.click();
        }, 3200);
    }
}

function fillAllRadios() {
    const allRadios = Array.from(document.querySelectorAll('input[type="radio"]'));
    const groups = {};
    
    allRadios.forEach(radio => {
        if (!groups[radio.name]) groups[radio.name] = [];
        groups[radio.name].push(radio);
    });
    
    for (const groupName in groups) {
        const group = groups[groupName];
        let selected = false;
        
        for(let r of group) {
            if(r.value === '5' || String(r.value).toLowerCase() === 'excellent' || String(r.value).toLowerCase() === 'a') {
                r.checked = true;
                selected = true;
                break;
            }
        }
        if (!selected && group.length > 0) {
            group[0].checked = true;
        }
    }
    
    document.querySelectorAll('textarea').forEach(ta => {
        if (ta.value.trim() === '') {
            ta.value = 'Good';
        }
    });
}

// Run check when page loads (this makes it loop through Course Feedback pages automatically)
window.addEventListener('load', checkAndRun);
checkAndRun();
