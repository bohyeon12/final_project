'use client'

import { usePathname } from 'next/navigation'
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator} from './ui/breadcrumb'
import { Fragment } from 'react';

function Breadcrumbs() {
    const path = usePathname();
    const segments = path.split('/');
  return (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>

            </BreadcrumbItem>
            {segments.map((segment,index) =>{
                if(!segment) return null;
                
//                const href = `/${segments.slice(0,index+1).join("/")}`;
//                const isLast = index === segment.length - 1;

                return (
                    <Fragment key={segment}>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{segment}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </Fragment>
                )
            })  
                
            }
        </BreadcrumbList>
    </Breadcrumb>
  )
}

export default Breadcrumbs
