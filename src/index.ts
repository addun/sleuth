import "firebase/firestore";
import firebase from "firebase/app";
import { fromEvent, merge } from "rxjs";
import {
  debounceTime,
  bufferTime,
  filter,
  throttleTime,
  map,
  tap,
} from "rxjs/operators";

const firebaseConfig = {
};

const app = firebase.initializeApp(firebaseConfig);

const userId = Math.random().toString(36).substring(2, 15);

interface UserEvent {
  timestamp: number;
  type: string;
  x?: number;
  y?: number;
  key?: string;
  windowX?: number;
  windowY?: number;
  target?: string;
}

function mapToUserEvent(
  event: Event | PointerEvent | KeyboardEvent
): UserEvent {
  const data: UserEvent = {
    timestamp: Date.now(),
    type: event.type,
  };

  data.timestamp = Date.now();
  data.type = event.type;

  if (event instanceof PointerEvent) {
    const target = event.target as HTMLElement;
    data.x = event.x;
    data.y = event.y;
    if (target) {
      data.target = target.id || target.classList.toString();
    }
  } else if (event instanceof KeyboardEvent) {
    data.key = event.key;
  } else if (event instanceof MouseEvent) {
    data.x = event.x;
    data.y = event.y;
  } else {
    switch (event.type) {
      case "scroll":
        data.windowX = window.scrollX;
        data.windowY = window.scrollY;
        break;
    }
  }

  return data;
}

async function pushEventsToServer(events: UserEvent[]) {
  const batch = firebase.firestore().batch();
  events.forEach((event) => {
    batch.set(
      firebase.firestore().collection(`users/${userId}/events`).doc(),
      event
    );
  });
  return batch.commit();
}

merge(
  fromEvent(document, "click"),
  fromEvent(document, "mousemove").pipe(throttleTime(100)),
  fromEvent(document, "keydown"),
  fromEvent(document, "scroll").pipe(debounceTime(100))
)
  .pipe(
    map((event) => mapToUserEvent(event)),
    bufferTime(10_000, null, 20),
    filter((events) => events.length > 0)
  )
  .subscribe((events) => {
    pushEventsToServer(events);
  });
