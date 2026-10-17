export type TourPackage = {
  id: string; title: string; image: string; days: number; price: number; previousPrice: number; destination: string; types: string[]; href?: string;
};

// These nine cards and their display prices come from Figma node 2288:5403.
// Do not manufacture the other fifteen packages suggested by its sample result count.
export const tourPackages: TourPackage[] = [
  {id:"golden-triangle-12-days",title:"Discover Golden Triangle Beauty - Small Group Tour 12 Days",image:"grid-imgFrame31.png",days:6,price:8952,previousPrice:12952,destination:"Golden Triangle",types:["Family","Group tours"],href:"/tours/golden-triangle-12-days"},
  {id:"manali-kasol",title:"Manali–Kasol Mountain Escape by Cab",image:"grid-imgFrame32.png",days:6,price:12999,previousPrice:15999,destination:"Himachal",types:["Adventure","Friends"]},
  {id:"goa-beach",title:"Goa Beach Break with North & South Tours",image:"grid-imgFrame33.png",days:4,price:9499,previousPrice:11999,destination:"Goa",types:["Beach","Family","Weekend getaways"]},
  {id:"kerala-backwaters",title:"Kerala Backwaters & Munnar Hills",image:"grid-imgFrame34.png",days:6,price:16999,previousPrice:20499,destination:"Kerala",types:["Family","Honeymoon"]},
  {id:"royal-rajasthan",title:"Royal Rajasthan: Jaipur, Jodhpur & Udaipur",image:"grid-imgFrame35.png",days:7,price:21999,previousPrice:26499,destination:"Rajasthan",types:["Family","Group tours"]},
  {id:"char-dham",title:"Char Dham Yatra by Road from Haridwar",image:"grid-imgFrame36.png",days:10,price:34999,previousPrice:39999,destination:"Uttarakhand",types:["Pilgrimage","Group tours"]},
  {id:"kashmir-winter",title:"Kashmir Winter Wonderland with Gulmarg Snow",image:"grid-imgFrame31.png",days:5,price:14999,previousPrice:17999,destination:"Kashmir",types:["Family","Adventure"]},
  {id:"golden-triangle",title:"Golden Triangle: Delhi, Agra & Jaipur",image:"grid-imgFrame37.png",days:5,price:13499,previousPrice:16499,destination:"Golden Triangle",types:["Family","Group tours"]},
  {id:"kashi-gaya",title:"Holy Trip to Kashi, Gaya & Prayagraj",image:"grid-imgFrame38.png",days:6,price:15999,previousPrice:18999,destination:"Uttar Pradesh",types:["Pilgrimage","Group tours"]},
];
