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
