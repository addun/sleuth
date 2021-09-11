import { fromEvent, merge } from "rxjs";
import {
  bufferTime,
  debounceTime,
  filter,
  map,
  tap,
  throttleTime,
} from "rxjs/operators";
import "firebase/firestore";
import firebaseApp from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR6erskXRbcoG5_yySMLITsSbxZ_3DaA0",
  authDomain: "sleuth-35cb9.firebaseapp.com",
  projectId: "sleuth-35cb9",
  storageBucket: "sleuth-35cb9.appspot.com",
  messagingSenderId: "22877442462",
  appId: "1:22877442462:web:cf8f3f5a25cb9304a9468f",
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);
const firestore = firebaseApp.firestore(app);

function mapToUserEvent(event: Event | MouseEvent | KeyboardEvent) {
  const data: Record<string, any> = {
    type: event.type,
    timestapamp: Date.now(),
    windowX: window.scrollX,
    windowY: window.scrollY,
  };
  if (event instanceof MouseEvent) {
    data.x = event.x;
    data.y = event.y;
  }

  if (event instanceof KeyboardEvent) {
    data.key = event.key;
  }

  return data;
}

async function pushEventsToServer(events: any[]) {
  const batch = firestore.batch();
  events.forEach((event) => {
    batch.set(firestore.collection("events").doc(), mapToUserEvent(event));
  });
  return batch.commit();
}

const clickEvents$ = fromEvent<MouseEvent>(document, "click");
const mouseMoveEvents$ = fromEvent<MouseEvent>(document, "mousemove").pipe(
  throttleTime(150)
);

const keyDownEvents$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  filter(($event) =>
    ["Alt", "Control", "Shift"].every((code) => $event.key !== code)
  )
);

const scrollEvents$ = fromEvent<Event>(document, "scroll").pipe(
  debounceTime(100)
);

merge(clickEvents$, keyDownEvents$, scrollEvents$, mouseMoveEvents$)
  .pipe(
    map((event) => mapToUserEvent(event)),
    bufferTime(20_000, null, 50),
    filter((events) => events.length > 0)
  )
  .subscribe((events) => pushEventsToServer(events));
