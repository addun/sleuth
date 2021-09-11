import { fromEvent, merge } from "rxjs";
import { bufferTime, debounceTime, filter, throttleTime } from "rxjs/operators";

async function pushEventsToServer(events: Event[]) {
  return new Promise((resolve, reject) => {
    let t = setTimeout(() => {
      console.log("Events sent");
      resolve(void 0);
    }, 1000);
  });
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
    bufferTime(2_500, null, 3),
    filter((events) => events.length > 0)
  )
  .subscribe((events) => pushEventsToServer(events));
