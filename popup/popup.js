var userBtn = document.getElementById('user-submit-btn');
var userInput = document.getElementById('user-input');
var deleteDataBtn = document.getElementById('delete-data-btn');
var addFriendBtn = document.getElementById('add-friend-btn');
var newFriendId = document.getElementById('new-friend-id');
var newFriendName = document.getElementById('new-friend-name');

let planSchedule = [];
let index = 0;

var friendsList = document.getElementById('friends-container');

function markActivePlan(oldIndex, newIndex) {
	let liElements = document.querySelectorAll('li');

	if (liElements.length > 1) {
		liElements[oldIndex].classList.remove('active');
		liElements[newIndex].classList.add('active');
	} else {
		liElements[0].classList.add('active');
	}
}

function drawSchedule() {
	// you
	userInput.value = planSchedule[0].index || '';

	// friends
	let friendsContainer = document.getElementById('friends-container');
	friendsContainer.innerHTML = '';

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
		div1.className = 'friend-name';
		div2.className = 'friend-index';
		inputText.type = 'text';
		inputText.value = planSchedule[i].index;

		selectBtn.innerText = 'Select';
		deleteBtn.innerText = 'Delete';

		h3.onchange = () => {
			planSchedule[i].name = h3.innerText;
		};
		selectBtn.onclick = () => {
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
	markActivePlan(index, index);
}

function addFriend(index, name) {
	let friend = {
		id: planSchedule.length,
		index: index,
		name: name,
	};
	planSchedule.push(friend);
	newFriendId.innerText = '';
	newFriendName.innerText = '';
	saveData();
	drawSchedule();
}

function deleteFriend(id) {
	planSchedule = planSchedule.filter((friend) => friend.id !== id);
	planSchedule.map((friend, index) => {
		friend.id = index;
	});
	saveData();
	drawSchedule();
}

function changeActivePlan(i) {
	let oldIndex = index;
	index = i;
	markActivePlan(oldIndex, i);
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
				index = activePlan;
				resolve();
			}
		);
	});
}

function saveData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(
			{ planData: planSchedule, activePlan: index },
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
	loadData().then(() => {
		drawSchedule();
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
