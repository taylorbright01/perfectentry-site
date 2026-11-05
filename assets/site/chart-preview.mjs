import {PerfectViewChart} from '../perfect-view/chart.mjs?v=20261104';
import {createDemoBars, aggregateBars} from '../perfect-view/core.mjs';
import {definitions} from '../perfect-view/studies.mjs';

// The same renderer and standard studies as Perfect View. A fixed sample
// keeps this marketing preview independent of feeds and subscriptions.
const canvas = document.querySelector('#home-chart-preview');
if (canvas) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    try {
      const raw = createDemoBars('EURUSD');
      const bars = aggregateBars(raw, 300, {now: raw.at(-1).time + 300});
      canvas.hidden = false;
      const chart = new PerfectViewChart(canvas);
      chart.setBars(bars, {timeframe: 300, precision: 5, reset: true});
      chart.count = matchMedia('(max-width:600px)').matches ? 36 : 64;
      chart.setFocus(false);
      chart.setCrosshair(false);
      chart.setModels(['ema', 'rsi'].map(id => {
        const study = definitions.find(item => item.id === id);
        return {...study.calculate(bars, {...study.defaults, color: id === 'ema' ? '#e3b975' : '#b4a2ff'}),
          key: id, title: id === 'ema' ? 'EMA 20' : 'RSI 14'};
      }));
      chart.draw();
      canvas.parentElement.querySelector('img').hidden = true;
    } catch (error) {
      canvas.hidden = true;
      console.warn('Chart preview unavailable', error);
    }
  }, {rootMargin: '120px'});
  observer.observe(canvas.parentElement);
}
