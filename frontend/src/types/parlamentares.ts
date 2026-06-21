export type ParliamentarianUserStatus = 'ACTIVE' | 'INACTIVE';
export type CondicaoMandato = 'TITULAR' | 'SUPLENTE';

export interface ParlamentarianUser {
    id: string;
    parliamentarianId: string;
    status: ParliamentarianUserStatus;
    parliamentaryName: string;
    officeNumber?: string;
    biography?: string;
    politicalParty?: { id: string; nome: string; sigla: string };
    legislatura: { id: string; descricao: string; anoInicio: number; anoFim: number };
    condicao: CondicaoMandato;
    titularAfastado?: { id: string; parliamentaryName: string };
    dataPosse?: string;
    user: { id: string; nome: string; cpf: string; foto?: string };
    lastAccessAt?: string;
    createdAt: string;
}

export interface ParliamentarianFull {
    id: string;
    tenantId: string;
    parliamentarianUsers: ParlamentarianUser[];
}

export interface UserResumo {
    id: string;
    nome: string;
    cpf: string;
    foto?: string;
}

export interface CreateParlamentarianDto {
    userId: string;
    parliamentaryName: string;
    officeNumber?: string;
    politicalPartyId?: string;
    legislaturaId: string;
    condicao: CondicaoMandato;
    titularAfastadoId?: string;
    dataPosse?: string;
}

export type CreateParlamentarianUserDto = CreateParlamentarianDto;

export interface UpdateParlamentarianUserDto {
    parliamentaryName?: string;
    officeNumber?: string;
    politicalPartyId?: string;
    biography?: string;
    status?: ParliamentarianUserStatus;
    dataPosse?: string;
}
