var userBtn = document.getElementById('user-submit-btn');
var userInput = document.getElementById('user-input');
var deleteDataBtn = document.getElementById('delete-data-btn');
var addFriendBtn = document.getElementById('add-friend-btn');
var newFriendId = document.getElementById('new-friend-id');
var newFriendName = document.getElementById('new-friend-name');

let planSchedule = [];
let activeIndex = null;

var friendsList = document.getElementById('friends-container');

function markActivePlan(newIndex = null) {
	let activeLiElements = document.querySelectorAll('li.active');
	if (activeLiElements) {
		activeLiElements.forEach((li) => {
			li.classList.remove('active');
		});
	}
	if (newIndex !== null) {
		let liElements = document.querySelectorAll('li');
		liElements[newIndex].classList.add('active');
	}

	// if (oldIndex === null) {
	// 	liElements[newIndex].classList.add('active');
	// } else if (liElements.length > 1) {
	// 	liElements[oldIndex].classList.remove('active');
	// 	liElements[newIndex].classList.add('active');
	// } else {
	// 	liElements[0].classList.add('active');
	// }
}

function drawSchedule() {
	// you
	userInput.value = planSchedule[0].index || '';

	// friends
	let friendsContainer = null;
	if (planSchedule.length > 1) {
		friendsContainer = document.getElementById('friends-container');
		if (!friendsContainer) {
			// create friends container
			friendsContainer = document.createElement('ul');
			friendsContainer.id = 'friends-container';
			friendsContainer.className = 'container';
			friendsContainer.innerHTML = '';
			let youContainer = document.getElementById('you-container');
			youContainer.insertAdjacentElement('afterend', friendsContainer);
			let h2 = document.createElement('h2');
			h2.className = 'container-title';
			h2.innerText = 'Friends';
			friendsContainer.appendChild(h2);
		} else {
			friendsContainer.innerHTML = '';
		}
	} else {
		// remove friends
		friendsContainer = document.getElementById('friends-container');
		if (friendsContainer) {
			friendsContainer.remove();
		}
	}

	for (let i = 1; i < planSchedule.length; i++) {
		let li = document.createElement('li');
		let h3 = document.createElement('h3');
		let div1 = document.createElement('div');
		let div2 = document.createElement('div');
		let inputText = document.createElement('input');
		let selectBtn = document.createElement('button');
		let deleteBtn = document.createElement('button');

		li.id = i;

		h3.innerText = planSchedule[i].name;
		h3.setAttribute('contenteditable', 'true');
		h3.setAttribute('spellcheck', 'false');
		h3.className = 'name';
		div1.className = 'name-container';
		div2.className = 'info-container';
		inputText.type = 'text';
		inputText.setAttribute('maxlength', '5');
		inputText.value = planSchedule[i].index;

		selectBtn.innerText = 'Select';
		deleteBtn.innerText = 'Delete';

		h3.onchange = () => {
			planSchedule[i].name = h3.innerText;
		};
		selectBtn.onclick = () => {
			planSchedule.map((friend, friendId) => {
				if (friendId === i) {
					friend.name = h3.innerText;
					friend.index = inputText.value;
				}
			});
			changeActivePlan(i);
		};
		deleteBtn.onclick = () => {
			deleteFriend(i);
		};

		div1.appendChild(h3);
		div2.appendChild(inputText);
		div2.appendChild(selectBtn);
		div2.appendChild(deleteBtn);
		li.appendChild(div1);
		li.appendChild(div2);
		friendsContainer.appendChild(li);
	}

	markActivePlan(activeIndex);
}

function addFriend(index, name) {
	let friend = {
		id: planSchedule.length,
		index: index,
		name: name,
	};
	planSchedule.push(friend);
	newFriendId.value = '';
	newFriendName.value = '';
	saveData().then(() => {
		drawSchedule();
	});
}

function deleteFriend(id) {
	planSchedule = planSchedule.filter((friend) => friend.id !== id);
	planSchedule.map((friend, index) => {
		friend.id = index;
	});
	if (activeIndex === id) {
		changeActivePlan(null);
	}
	saveData().then(() => {
		drawSchedule();
		adjustRootHeight();
	});
}

function adjustRootHeight() {
	const root = document.documentElement;
	const body = document.body;
	root.style.height = body.offsetHeight + 'px';
}

function changeActivePlan(i) {
	activeIndex = i;
	markActivePlan(i);
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			planData: planSchedule,
			activePlan: i,
		});
	});
}

function loadData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(
			['planData', 'activePlan'],
			function ({ planData, activePlan }) {
				planSchedule = planData || [{ id: 0, index: '', name: 'You' }];
				activeIndex = activePlan;
				resolve();
			}
		);
	});
}

function saveData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(
			{ planData: planSchedule, activePlan: activeIndex },
			() => {
				resolve();
			}
		);
	});
}

function deleteData() {
	planSchedule = [];
	chrome.storage.local.remove('planData');
	chrome.storage.local.remove('activePlan');
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
	location.reload();
}

window.addEventListener('load', async (event) => {
	loadData()
		.then(() => {
			drawSchedule();
		})
		.then(() => {
			markActivePlan(activeIndex);
		});
});

userBtn.addEventListener('click', () => {
	planSchedule[0].index = userInput.value;
	changeActivePlan(0);
});

addFriendBtn.addEventListener('click', () => {
	addFriend(newFriendId.value, newFriendName.value);
});

deleteDataBtn.addEventListener('click', () => {
	deleteData();
});
