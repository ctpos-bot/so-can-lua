export function speakWeight(weight: number): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!Number.isFinite(weight) || weight <= 0) return;

  try {
    window.speechSynthesis.cancel();
    const whole = Math.floor(weight);
    const decimal = Math.round((weight - whole) * 100);

    let text = `${whole} ký`;
    if (decimal === 50) {
      text = `${whole} ký rưỡi`;
    } else if (decimal > 0) {
      const decStr = String(decimal).replace(/0+$/, '');
      text = `${whole} phẩy ${decStr} ký`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}
