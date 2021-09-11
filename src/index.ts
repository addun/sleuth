import firebaseApp from "firebase/app";
import "firebase/firestore";
import { fromEvent, merge } from "rxjs";
import {
  bufferTime,
  debounceTime,
  filter,
  map,
  throttleTime,
} from "rxjs/operators";

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
    console.log("mouse!!!", event.x);
    data.x = event.x;
    data.y = event.y;
    console.log(data);
  }

  if (event instanceof KeyboardEvent) {
    data.key = event.key;
  }

  return data;
}

async function pushEventsToServer(events: any[]) {
  const batch = firestore.batch();
  events.forEach((event) => {
    batch.set(firestore.collection("events").doc(), event);
  });
  return batch.commit();
}

const clickEvents$ = fromEvent<MouseEvent>(document, "click");

const mouseMoveEvents$ = fromEvent<MouseEvent>(document, "mousemove").pipe(
  throttleTime(25)
);

const keyDownEvents$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  filter(($event) =>
    ["Alt", "Control", "Shift"].every((code) => $event.key !== code)
  )
);

const scrollEvents$ = fromEvent<Event>(document, "scroll").pipe(
  debounceTime(100)
);

// merge(clickEvents$, keyDownEvents$, scrollEvents$, mouseMoveEvents$)
merge(mouseMoveEvents$)
  .pipe(
    map((event) => mapToUserEvent(event)),
    bufferTime(20_000, null, 5),
    filter((events) => events.length > 0)
  )
  .subscribe((events) => pushEventsToServer(events));
