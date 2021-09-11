import "firebase/firestore";
import firebaseApp from "firebase/app";
import { from, of, timer } from "rxjs";
import {
  concatMap,
  delay,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";

function attachCursorRippleEffect({ x, y }: { x: number; y: number }) {
  const ripple = document.createElement("div");

  ripple.className = "ripple";
  document.body.appendChild(ripple);

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  ripple.style.animation = "ripple-effect .4s  linear";
  ripple.onanimationend = () => document.body.removeChild(ripple);
}

const iframe = document.querySelector("iframe")!;
const fakePointer = document.querySelector<HTMLElement>("#fakePointer")!;

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBR6erskXRbcoG5_yySMLITsSbxZ_3DaA0",
  authDomain: "sleuth-35cb9.firebaseapp.com",
  projectId: "sleuth-35cb9",
  storageBucket: "sleuth-35cb9.appspot.com",
  messagingSenderId: "22877442462",
  appId: "1:22877442462:web:cf8f3f5a25cb9304a9468f",
};

const app = firebaseApp.initializeApp(firebaseConfig);
const firestore = firebaseApp.firestore(app);

from(firestore.collection("events").orderBy("timestapamp", "asc").get())
  .pipe(
    map((snapshot) => snapshot.docs.map((doc) => doc.data())),
    switchMap((events) => from(events).pipe(withLatestFrom(of(events[0])))),
    mergeMap(([event, firstEvent]) => {
      const diff = event.timestapamp - firstEvent.timestapamp;
      return timer(diff).pipe(map(() => event));
    })
  )
  .subscribe((event) => {
    switch (event.type) {
      // case "click":
      // attachCursorRippleEffect({ x: event.x, y: event.y });
      // break;
      // case "scroll":
      // iframe.contentWindow!.scrollTo(event.x, event.y);
      // break;
      case "mousemove":
        fakePointer.style.left = event.x + "px";
        fakePointer.style.top = event.y + "px";
    }
  });
