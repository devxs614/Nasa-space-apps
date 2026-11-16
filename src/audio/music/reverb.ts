/** Respuesta de reverberación generada: ruido estéreo con caída exponencial de 4,5 s. Sin archivos. */
export function makeReverb(ctx: BaseAudioContext, seconds = 4.5): ConvolverNode {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
  }
  const node = ctx.createConvolver();
  node.buffer = impulse;
  return node;
}
