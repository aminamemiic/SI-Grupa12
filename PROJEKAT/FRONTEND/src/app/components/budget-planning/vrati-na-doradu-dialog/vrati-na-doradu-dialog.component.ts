import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vrati-na-doradu-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vrati-na-doradu-dialog.component.html',
  styleUrl: './vrati-na-doradu-dialog.component.css',
})
export class VratiNaDoraduDialogComponent {
  @Output() zatvoreno = new EventEmitter<{ komentar: string } | null>();

  public komentar = '';

  public odustani(): void {
    this.zatvoreno.emit(null);
  }

  public potvrdi(): void {
    const trimmedKomentar = this.komentar.trim();
    if (trimmedKomentar.length < 10) {
      return;
    }

    this.zatvoreno.emit({ komentar: trimmedKomentar });
  }
}
