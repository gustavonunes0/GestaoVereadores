import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    AuthenticatedUser,
    isParlamentarianUser,
    isStaffUser,
} from '../../../../common/types/authenticated-request';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';

export type JitsiTokenHttp = {
    domain: string;
    roomName: string;
    token: string | null;
};

@Injectable()
export class GetJitsiTokenUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        user: AuthenticatedUser,
    ): Promise<JitsiTokenHttp> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) {
            throw new NotFoundException('Sessão plenária não encontrada');
        }

        const podeTransmitir =
            sessao.statusSessao === StatusSessao.ABERTA ||
            sessao.statusSessao === StatusSessao.SUSPENSA;

        if (!podeTransmitir) {
            throw new BadRequestException(
                'Inicie a transmissão apenas com a sessão aberta ou suspensa',
            );
        }

        const domain =
            this.config.get<string>('JITSI_DOMAIN')?.trim() || 'meet.jit.si';
        const roomName = `sessao-${sessaoId.replace(/-/g, '').slice(0, 16)}`;
        const appId = this.config.get<string>('JITSI_APP_ID')?.trim();
        const appSecret = this.config.get<string>('JITSI_APP_SECRET')?.trim();
        // No Jitsi self-hosted o "sub" é o tenant/domínio XMPP (ex.: meet.jitsi),
        // não o host público. Default "*" é aceito pela maioria das instalações.
        const sub = this.config.get<string>('JITSI_SUB')?.trim() || '*';

        const displayName =
            (isParlamentarianUser(user) && user.parliamentaryName) ||
            user.nome ||
            'Operador';

        let token: string | null = null;
        if (appId && appSecret) {
            token = this.jwtService.sign(
                {
                    aud: 'jitsi',
                    iss: appId,
                    sub,
                    room: roomName,
                    context: {
                        user: {
                            name: displayName,
                            moderator: isStaffUser(user),
                        },
                    },
                },
                { secret: appSecret, expiresIn: '2h' },
            );
        }

        return { domain, roomName, token };
    }
}
