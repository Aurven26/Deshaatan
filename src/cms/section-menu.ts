import type {Field} from 'payload';

export const sectionAction=(name:string,label:string,visibilityPath:string):Field=>({name,type:'ui',admin:{components:{Field:{path:'@/components/section-menu-field#SectionLabel',clientProps:{label,visibilityPath}}}}});

/** Presentation only: visibility is stored in the existing document fields. */
export function sectionMenu(field: Field, visibilityPath: string): Field {
  const component = field.type === 'array' ? 'SectionArray' : field.type === 'blocks' ? 'SectionBlocks' : undefined;
  field.admin ||= {};
  if (component) Object.assign(field.admin,{components:{...field.admin.components,Field:{path:`@/components/section-menu-field#${component}`,clientProps:{visibilityPath}}}});
  else if ('name' in field && field.type !== 'ui') Object.assign(field.admin,{components:{...field.admin.components,Label:{path:'@/components/section-menu-field#SectionLabel',clientProps:{visibilityPath,label:typeof field.label === 'string' ? field.label : field.name.replace(/([A-Z])/g,' $1').replace(/^./,letter=>letter.toUpperCase()),required:'required' in field && field.required === true}}}});
  return field;
}
