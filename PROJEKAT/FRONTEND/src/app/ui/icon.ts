import { Component, Input } from '@angular/core';

const paths: Record<string, string[]> = {
  grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  wallet: [
    'M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h15V7H5a2 2 0 0 1 0-4',
    'M20 11h-5v6h5M16 14h.01',
  ],
  upload: ['M12 16V3m-5 5 5-5 5 5', 'M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5'],
  chart: ['M4 3v17h17M8 15v-4m5 4V7m5 8V4'],
  pie: ['M21 12a9 9 0 1 1-9-9v9z', 'M15 3.5V9h5.5A9 9 0 0 0 15 3.5Z'],
  file: ['M14 2H5v20h14V7zM14 2v6h5M8 12h8m-8 4h8'],
  layers: ['m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4'],
  arrow: ['M5 12h14m-5-5 5 5-5 5'],
  down: ['m7 10 5 5 5-5'],
  plus: ['M12 5v14M5 12h14'],
  sparkle: ['m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'],
  logout: ['M9 3H4v18h5m5-14 5 5-5 5m-6-5h11'],
  menu: ['M4 6h16M4 12h16M4 18h16'],
  close: ['m6 6 12 12M6 18 18 6'],
  settings: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
    'm9 3-.7 2-2 .8-2-.8L2 9l1.5 1.5v3L2 15l2.3 4 2-.8 2 .8.7 2h6l.7-2 2-.8 2 .8 2.3-4-1.5-1.5v-3L22 9l-2.3-4-2 .8-2-.8L15 3z',
  ],
  calendar: ['M4 5h16v16H4zM4 10h16M8 3v4m8-4v4'],
  check: ['m5 12 4 4L19 6'],
  clock: ['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2'],
};

@Component({
  selector: 'ui-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    @for (path of iconPaths; track $index) {
      <path [attr.d]="path" />
    }
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:20px;height:20px;flex:none;align-items:center;justify-content:center}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'grid';
  get iconPaths(): string[] {
    return paths[this.name] || paths['grid'];
  }
}
