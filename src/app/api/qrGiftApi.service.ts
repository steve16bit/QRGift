import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrGiftApiService {

  private apiUrl = 'https://qrgiftapi-fycqerfehrfmgjff.brazilsouth-01.azurewebsites.net/api';
  // private apiUrl = 'https://localhost:7218/api';

  constructor(private httpClient: HttpClient) { }

  postGift(data: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/GiftWebSite`, data)
  }
}
