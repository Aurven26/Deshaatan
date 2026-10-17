import type {Block,Field} from 'payload';
const spacing:Field={name:'space',label:'Space above section (pixels)',type:'number',min:0,max:200,defaultValue:20};
const body:Field={name:'body',label:'Text',type:'richText',required:true};
const blocks:Block[]=[
  {slug:'heading',labels:{singular:'Heading',plural:'Headings'},fields:[{name:'text',type:'text',required:true},{name:'level',type:'select',defaultValue:'h2',options:[{label:'Main heading (H1)',value:'h1'},{label:'Section heading (H2)',value:'h2'},{label:'Subheading (H3)',value:'h3'}]},spacing]},
  {slug:'text',labels:{singular:'Text / paragraph',plural:'Text sections'},fields:[body,{name:'style',type:'select',defaultValue:'paragraph',options:['paragraph','updated','tagline']},spacing]},
  {slug:'list',labels:{singular:'Bullet list',plural:'Bullet lists'},fields:[{name:'items',type:'array',fields:[body]},spacing]},
  {slug:'table',labels:{singular:'Table',plural:'Tables'},fields:[{name:'rows',type:'array',admin:{description:'The first row is the table header. Add cells from left to right.'},fields:[{name:'cells',type:'array',fields:[body]}]},spacing]},
  {slug:'divider',labels:{singular:'Divider line',plural:'Divider lines'},fields:[spacing]},
  {slug:'cta',labels:{singular:'Contact link / button',plural:'Contact links'},fields:[{name:'label',type:'text',required:true},{name:'href',label:'Link URL',type:'text',defaultValue:'/contact-us',required:true,validate:(value:string|null|undefined)=>!!value&&/^(\/[^/]|\/$|https?:\/\/)/.test(value)||'Enter a relative path or HTTP(S) URL.'},spacing]},
  {slug:'image',labels:{singular:'Image',plural:'Images'},fields:[{name:'image',type:'upload',relationTo:'media',required:true},{name:'caption',type:'text'},spacing]},
];
export const pageSections:Field={name:'sections',label:'Page sections',type:'blocks',admin:{description:'Add, edit, reorder or hide sections without deleting their content.'},blocks:blocks.map(block=>({...block,fields:[{name:'visible',label:'Show this section',type:'checkbox',defaultValue:true},...block.fields]}))};
