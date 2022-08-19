import { Account } from './account.interface';

export interface IC {
  attributes: {
    BIC: string;
  };
  ParticipantInfo: {
    attributes: {
      NameP: string;
      CntrCd: string;
      Rgn: string;
      Ind: string;
      Tnp: string;
      Nnp: string;
      Adr: string;
      DateIn: string;
      PfType: string;
      Srvcs: string;
      XchType: string;
      UID: string;
      ParticipantStatus: string;
    };
  };
  Accounts: Account | Array<Account>;
}
