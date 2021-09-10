import firebase from "firebase/app";
import "firebase/firestore";
import { defer, timer } from "rxjs";
import { map } from "rxjs/operators";

function applyCursorRippleEffect({ x, y }: { x: number; y: number }) {
  const ripple = document.createElement("div");

  ripple.className = "ripple";
  document.body.appendChild(ripple);

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  ripple.style.animation = "ripple-effect .4s  linear";
  ripple.onanimationend = () => document.body.removeChild(ripple);
}

const firebaseConfig = {};
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

function getUserRecord(recordId: string) {
  return firestore.collection(`user-records/${recordId}/events`);
}

async function userRecords() {
  const t = await firestore.collection(`user-records`).get();
  return t.docs.map((d) => d.data());
}

userRecords().then(console.log);

const iframe = document.querySelector("iframe")!;

// defer(() =>
//   getUserRecord("Ye1ua03IRnShdEyUbLD7").orderBy("createdAt", "asc").get()
// )
//   .pipe(map((response) => response.docs.map((d) => d.data())))
//   .subscribe((data) => {
//     const first = new Date(data[0].createdAt);

//     for (const event of data) {
//       const diff = +new Date(event.createdAt) - +first;
//       timer(diff).subscribe(() => {
//         if (event.type === "mousemove") {
//           fakePointer.style.left = event.mouseX + "px";
//           fakePointer.style.top = event.mouseY + "px";
//         } else if (event.type === "click") {
//           applyCursorRippleEffect({ x: event.mouseX, y: event.mouseY });
//         } else if (event.type === "scroll") {
//           iframe.contentWindow!.scrollTo(event.windowX, event.windowY);
//         }
//       });
//     }
//   });
