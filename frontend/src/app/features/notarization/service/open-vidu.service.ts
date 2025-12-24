import { Injectable } from '@angular/core';
import { NotarizationApiService } from 'src/app/core/services/business';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenViduService {

  constructor(private notarizationApiService: NotarizationApiService) {}

  public async getToken(sessionId: string): Promise<string | undefined> {
    await this.createSession(sessionId);
    return await this.createToken(sessionId);
  }

  private createSession(sessionId: string): Promise<string | undefined> {
    return firstValueFrom(this.notarizationApiService.createSession(sessionId));
  }

  private async createToken(sessionId: string): Promise<string | undefined> {
    const response = await firstValueFrom(this.notarizationApiService.createToken(sessionId));
    return response?.token;
  }
}
