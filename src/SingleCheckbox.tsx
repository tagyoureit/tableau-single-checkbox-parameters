import { Checkbox } from '@tableau/tableau-ui';
import * as React from 'react';

/* tslint:disable:no-console */

export interface BCProps {
    bg: any;
    checked: boolean;
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
    parameter: string;
    show_name: boolean;
    txt: any;
}

// Shows if setting has not yet been configured
export const SingleCheckbox: React.SFC<BCProps> = (props) => {


   

    return (
        <div className='d-flex flex-fill flex-wrap' >
           <div className='pr-2' style={{ fontWeight: 'bold', color: props.txt}}>
                {props.show_name?props.parameter:''}
                    
                     </div>
                     <div style={{marginBottom: '0'}}>
                     <Checkbox onChange={props.onChange} checked={props.checked} 
            style={{ marginLeft: '4px'}}
            ><span style={{color: props.txt}}>{props.label}</span> </Checkbox>

                     </div>

        </div>
    );
};

SingleCheckbox.displayName = 'Selector';
