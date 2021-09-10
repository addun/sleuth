async function pushEventsToServer(events: Event[]) {
  return new Promise((resolve, reject) => {
    let t = setTimeout(() => {
      console.log("Events sent");
      resolve(void 0);
    }, 1000);
  });
}

let eventsToSend: Event[] = [];

async function pushEventToCache($event: Event) {
  eventsToSend.push($event);
  if (eventsToSend.length === 10) {
    await pushEventsToServer(eventsToSend);
    eventsToSend = [];
  }
}

document.onclick = async function ($event) {
  pushEventToCache($event);
};

document.onkeydown = async function ($event) {
  if ($event.key !== "Enter") {
    return;
  }
  pushEventToCache($event);
};

let currentTimeout = 0;
document.onscroll = async function ($event) {
  clearTimeout(currentTimeout);

  currentTimeout = window.setTimeout(() => {
    pushEventToCache($event);
  }, 100);
};
