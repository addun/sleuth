import firebase from "firebase/app";
import "firebase/firestore";
import { defer, forkJoin, fromEvent, merge, timer } from "rxjs";
import {
  bufferCount,
  map,
  mapTo,
  mergeMap,
  repeatWhen,
  shareReplay,
  switchMap,
  takeUntil,
  throttleTime,
} from "rxjs/operators";

const firebaseConfig = {};
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

class UserEvent {
  createdAt: number = Date.now();
  type: string;
  windowX: number = window.scrollX;
  windowY: number = window.scrollY;
  mouseX?: number;
  mouseY?: number;

  constructor(event: Event) {
    this.type = event.type;
    if (event instanceof MouseEvent) {
      this.mouseX = event.x;
      this.mouseY = event.y;
    }
  }
}

const userEventsDocument$ = defer(async () => {
  const userId = Math.random().toString(36).substring(7);
  const { width, height } = window.screen;
  return firestore.collection(`user-records`).add({
    url: window.location.href,
    userId: userId,
    screen: { width, height },
    createdAt: Date.now(),
  });
}).pipe(shareReplay());

const userEvents$ = userEventsDocument$.pipe(
  map((document) => document.collection("events"))
);

function saveEvents(events: UserEvent[]) {
  return userEvents$.pipe(
    switchMap((collection) => {
      const batch = firestore.batch();
      events.forEach((e) => batch.set(collection.doc(), { ...e }));
      return batch.commit();
    })
  );
}

merge<UserEvent>(
  fromEvent(window, "scroll").pipe(
    throttleTime(100),
    map((event) => new UserEvent(event))
  ),
  fromEvent<MouseEvent>(document.body, "mousemove").pipe(
    throttleTime(25),
    map((event) => new UserEvent(event))
  ),
  fromEvent<MouseEvent>(document.body, "click").pipe(
    map((event) => new UserEvent(event))
  )
)
  .pipe(
    bufferCount(150),
    mergeMap((events) => saveEvents(events))
  )
  .subscribe();
