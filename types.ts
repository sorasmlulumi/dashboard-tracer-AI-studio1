
export interface Finding {
  'มาตรฐาน': string;
  'Type clinic': string;
  'Site': string;
  'Standard': string;
  'Finding': string;
  'IQA_ID': string;
  'IQA_Checklist': string;
  'Department': string;
  'Status': 'Met' | 'Not Met' | 'N/A' | string;
  'Type Problem': string;
  'Type Standard': string;
  'Type of Improvment': string;
  'Finding detail': string;
  'Date Tracer': string;
  'Date Update': string;
  'Date Finished': string;
  'Date Auditer': string;
  'User Audit': string;
  'User Department': string;
  'Date edit': string;
  'Status Update': string;
  'Update Finish': string;
  'Rating (0-5)': string;
  'Checkbox': string;
  'User Auditor': string;
  'User Depart': string;
  'Name': string;
  'Name Auditor': string;
  'Auditor - check completed': string;
  'Finding Audutor': string;
  'Rated By': string;
  'User ratings': string;
  [key: string]: string;
}
