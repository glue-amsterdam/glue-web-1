export interface OpenCloseTime {
  open: string;
  close: string;
}

export interface VisitingHours {
  hours: {
    [key: string]: OpenCloseTime[];
  };
}
