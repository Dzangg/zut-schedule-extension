export function saveData(value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ studentIndex: value }, () => {
      resolve(value);
    });
  });
}

export function getData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('studentIndex', function (item) {
      const data = item.studentIndex;
      if (!data) {
        reject('Student index not found.');
      }
      resolve(data);
    });
  });
}
