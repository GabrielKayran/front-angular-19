import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
	selector: 'img[appImageFallback]',
	standalone: true,
})
export class ImageFallbackDirective {
	@Input() appImageFallback = 'assets/images/default.png';

	private readonly _el = inject(ElementRef<HTMLImageElement>);

	@HostListener('error', ['$event'])
	onError(): void {
		const img = this._el.nativeElement;
		if (img.src !== this.appImageFallback) {
			img.src = this.appImageFallback;
		}
	}
}
