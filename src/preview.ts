import "firebase/firestore";
import firebase from "firebase/app";
import { from, of, timer } from "rxjs";
import { map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";

const firebaseConfig = {};

const app = firebase.initializeApp(firebaseConfig);

const urlSearchParams = new URLSearchParams(window.location.search);
const queryParams = Object.fromEntries(urlSearchParams.entries());

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
from(
  firebase
    .firestore()
    .collection(`users/${queryParams["userId"]}/events`)
    .orderBy("timestamp", "asc")
    .get()
)
  .pipe(
    map((snapshot) => snapshot.docs.map((doc) => doc.data())),
    switchMap((events) => of(...events).pipe(withLatestFrom(of(events[0])))),
    mergeMap(([event, firstEvent]) => {
      const diff = event.timestamp - firstEvent.timestamp;
      return timer(diff).pipe(map(() => event));
    })
  )
  .subscribe((event) => {
    switch (event.type) {
      case "mousemove":
        fakePointer.style.left = `${event.x}px`;
        fakePointer.style.top = `${event.y}px`;
        break;
      case "click":
        attachCursorRippleEffect({ x: event.x, y: event.y });
        if (event.target) {
          iframe
            .contentWindow!.document.querySelector<HTMLElement>(
              `.${event.target.split(" ").join(".")}`
            )!
            .focus();
        }
        break;
      case "scroll":
        iframe.contentWindow!.scrollTo(event.windowX, event.windowY);
        break;
      case "keydown": {
        const activeElement = iframe.contentWindow!.document!
          .activeElement as any;
        if ("value" in activeElement) {
          activeElement.value += event.key;
        }
      }
    }
  });
