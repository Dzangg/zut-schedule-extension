var input = document.getElementById('number');
var btn = document.getElementById('BtnSubmit');

// on window load
window.addEventListener('load', () => {
	// chrome.storage.local.remove('planData');
	// chrome.storage.local.remove('activePlan');
	getData()
		.then(({ planData, activePlan }) => {
			// can be 0
			if (activePlan !== null && activePlan !== undefined) {
				changeInput(planData[activePlan].index);
			}
		})
		.catch((err) => {
			console.log(err);
		});
});

function changeInput(value) {
	input.value = value;
	btn.click();
}

// on message received from popup
chrome.runtime.onMessage.addListener(
	({ planData, activePlan }, sender, sendResponse) => {
		// console.log('message received');
		// console.log('planData', planData);
		// console.log('activePlan', activePlan);
		saveData(planData, activePlan);
		if (activePlan !== null && activePlan !== undefined) {
			changeInput(planData[activePlan].index);
		}
	}
);

function saveData(planData, activePlan) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(
			{ planData: planData, activePlan: activePlan },
			() => {
				// console.log('saved data: ', planData, activePlan);
				resolve({ planData: planData, activePlan: activePlan });
			}
		);
	});
}

function getData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(
			['planData', 'activePlan'],
			function ({ planData, activePlan }) {
				// console.log('loaded data: ', planData, activePlan);
				if (!planData) {
					reject('Plan data not found.');
				}
				resolve({ planData: planData, activePlan: activePlan });
			}
		);
	});
}
