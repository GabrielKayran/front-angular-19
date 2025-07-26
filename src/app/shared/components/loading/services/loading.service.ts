import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class LoadingService {
	loadingSignal = signal(false);

	/**
	 * Contains in-progress loading requests
	 */
	private _loadingMap: Map<string, boolean> = new Map<string, boolean>();

	/**
	 * Sets the loadingSub property value based on the following:
	 * - If loading is true, add the provided url to the _loadingMap with a true value, set loadingSub value to true
	 * - If loading is false, remove the _loadingMap entry and only when the map is empty will we set loadingSub to false
	 * This pattern ensures if there are multiple requests awaiting completion, we don't set loading to false before
	 * other requests have completed. At the moment, this function is only called from the @link{HttpRequestInterceptor}
	 * @param loading {boolean}
	 * @param url {string}
	 */
	setLoading(loading: boolean, url?: string): void {
		const urlAux = url || 'default';
		if (loading) {
			this._loadingMap.set(urlAux, loading);
			this.loadingSignal.set(true);
		} else if (!loading && this._loadingMap.has(urlAux)) {
			this._loadingMap.delete(urlAux);
		}
		if (this._loadingMap.size === 0) {
			this.loadingSignal.set(false);
		}
	}
}
