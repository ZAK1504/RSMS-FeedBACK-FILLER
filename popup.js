const btn = document.getElementById('toggleBtn');
const statusText = document.getElementById('statusText');

// Load current state when you click the extension icon
chrome.storage.local.get(['isActive'], function(result) {
    updateUI(result.isActive);
});

// When you click the button, toggle the state
btn.onclick = () => {
    chrome.storage.local.get(['isActive'], function(result) {
        const newState = !result.isActive; // flip it
        
        // Save the new state
        chrome.storage.local.set({isActive: newState}, function() {
            updateUI(newState);
            
            // If we just turned it ON, tell the current page to start immediately!
            if (newState) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if(tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {command: "run"}, function(response) {
                            // This suppresses the error if you click the button on a non-Rajagiri tab
                            if (chrome.runtime.lastError) {
                                console.log("Not a valid page or page needs a refresh.");
                            }
                        });
                    }
                });
            }
        });
    });
};

function updateUI(isActive) {
    if (isActive) {
        btn.innerText = "STOP";
        btn.className = "stop";
        statusText.innerHTML = "Status: <b style='color:green'>RUNNING</b>";
    } else {
        btn.innerText = "START FILLING";
        btn.className = "";
        statusText.innerHTML = "Status: <b style='color:red'>OFF</b>";
    }
}
