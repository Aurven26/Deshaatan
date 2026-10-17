export const sectionLabels={
  shared:{header:'Website header',footer:'Website footer'},
  itinerary:{introduction:'Title and trip summary',gallery:'Photo gallery',enquiry:'Enquiry form',navigation:'Section navigation',overview:'Overview',highlights:'Trip highlights',itinerary:'Day-by-day itinerary',inclusions:'Inclusions',exclusions:'Exclusions',faqs:'FAQs',reviews:'Reviews',featuredReview:'Featured review below photos',signup:'Sign-up banner',policies:'Booking policies',related:'Related destinations',attractions:'More attractions',activities:'More things to do',floatingEnquiry:'Floating enquiry bar'},
  packages:{introduction:'Page introduction',search:'Search bar',types:'Trip-type filters',filters:'Sidebar filters',help:'Specialist help card',results:'Tour package results',customTrip:'Custom trip banner',why:'Why Deshaatan',faqs:'Package FAQs'},
  faq:{introduction:'Page introduction',categories:'Category filters',questions:'Questions and answers',help:'Help and contact panel'},
  contact:{introduction:'Page introduction',email:'Email',social:'Social media',location:'Office address',phone:'Phone',map:'Office map'},
  pages:{navigation:'Company information navigation',introduction:'Introduction text',sections:'Content sections'},
};
export type SectionVisibility=Partial<Record<keyof typeof sectionLabels,Record<string,boolean|null|undefined>|null>>;
export const sectionVisible=(settings:SectionVisibility,scope:keyof typeof sectionLabels,name:string)=>settings[scope]?.[name]!==false;
