import { Button } from '@tableau/tableau-ui'
import * as React from 'react';
import Colors from './Colors'
import PreviewButton from './PreviewButton'
import { Setting } from './Setting';
import { ShowName } from './ShowName'
import { WhichLabel } from './WhichLabel';


// import { Col, Row } from 'reactstrap';

/* tslint:disable:no-console */
declare global {
    interface Window { tableau: any; }
}

interface State {
    bg: string, // string for the background color
    allowableValues: any, // object to hold values of parameter
    configured: boolean, // is the extension configured?
    param_config: boolean, // is the parameter configured ? 
    param_enabled: boolean, // are there parameters that can be utilized by this extension?
    param_list: string[], // list of paramaters to be shown to user for selection
    parameter: string, // name of the chosen parameter
    show_name: boolean, // do we show the parameter name in the UI?
    txt: string, // string for color of the text
    which_label: number // are we using the first value (0) or second value (1)

}

let dashboard: any;
const unregisterHandlerFunctions: any = [];

const Loading: string = 'Loading...';
const NoParametersFound: string = 'No appropriate input parameters found!';

class Configure extends React.Component<any, State> {


    public state: State = {
        allowableValues: {},
        bg: '#ffffff',
        configured: false,
        param_config: false,
        param_enabled: false,
        param_list: [],
        parameter: '',
        show_name: false,
        txt: '#000000',
        which_label: 0



    }

    public constructor(props: any) {
        super(props)
        this.paramChange = this.paramChange.bind(this)
        this.whichChange = this.whichChange.bind(this)
        this.showNameChange = this.showNameChange.bind(this)
        this.bgChange = this.bgChange.bind(this)
        this.txtChange = this.txtChange.bind(this)
        this.submit = this.submit.bind(this)
        this.cancel = this.cancel.bind(this)
        this.extend = this.extend.bind(this)
        this.populateParamList = this.populateParamList.bind(this)
        this.testParamSettings = this.testParamSettings.bind(this)
    }

    public populateParamList() {
        // While performing async task, show loading message to user.
        // $('#loading').addClass('show');

        // Whenever we restore the filters table, remove all save handling functions,
        // since we add them back later in this function.
        unregisterHandlerFunctions.forEach((unregisterHandlerFunction: any) => {
            unregisterHandlerFunction();
        });

        this.setState({
            param_list: [Loading],
            parameter: Loading,
        });
        dashboard.getParametersAsync().then((params: any) => {
            const dropdownList: string[] = [];
            for (const p of params) {
                console.log(`${p.name} is of type ${p.allowableValues.type}`)
                console.log(p)
                if (p.allowableValues.type === 'list' && p.allowableValues.allowableValues.length >= 2) {
                    dropdownList.push(p.name);
                }
            }
            if (dropdownList.length > 0) {
                this.setState({
                    param_enabled: true,
                    param_list: dropdownList,
                    parameter: dropdownList[0],
                });
            } else {
                this.setState({
                    param_enabled: false,
                    param_list: [NoParametersFound],
                    parameter: NoParametersFound,
                });
            }
        });


        // don't forget to setup LISTENERS

    }

    // Handles change in background color input
    public bgChange = (color: any): void => {
        this.setState({ bg: color.target.value });
    };

    // Handles change in text color input
    public txtChange = (color: any): void => {
        this.setState({ txt: color.target.value });
    };


    public testParamSettings = () => {
        this.populateParamList()
        const settings = window.tableau.extensions.settings.getAll();

        // try to find the parameter to see if it still exists
        dashboard.findParameterAsync(settings.parameter).then((param: any) => {
            if (param.name === settings.parameter) {
                this.setState({
                    // must make a shallow copy of the array since the object
                    // won't exist if the setState function is queued
                    allowableValues: this.extend(true, param.allowableValues, {}),
                    bg: settings.bg || '#ffffff',
                    configured: true,
                    param_config: true,
                    parameter: settings.parameter,
                    show_name: settings.show_name === 'true' ? true : false,
                    txt: settings.txt || '#000000',
                    which_label: settings.which_label==='0'?0:1
                });
                console.log(`Found existing match: ${param.name} has values ${param.allowableValues.allowableValues[0]} and ${param.allowableValues.allowableValues}`)
            }
        }

        )
    }


    // Typescript version of https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    // Pass in the objects to merge as arguments.
    // For a deep extend, set the first argument to `true`.
    public extend = (...args: any) => {

        // Variables
        const extended = {};
        let deep = false;
        let i = 0;
        const length = args.length;

        // Check if a deep merge
        if (Object.prototype.toString.call(args[0]) === '[object Boolean]') {
            deep = args[0];
            i++;
        }

        // Merge the object into the extended object
        const merge = (obj: any) => {
            for (const prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = this.extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (; i < length; i++) {
            const obj = args[i];
            merge(obj);
        }

        return extended;

    };
    // Sets which tableau parameter to updateo
    public setParam = (): void => {
        if (this.state.parameter !== '') {

            dashboard.findParameterAsync(this.state.parameter).then((param: any) => {
                console.log(`${param.name} has values ${param.allowableValues.allowableValues[0]} and ${param.allowableValues.allowableValues}`)



                // must make a shallow copy of the array since the object
                // won't exist if the setState function is queued
                this.setState({
                    allowableValues: this.extend(true, param.allowableValues, {}),
                    configured: true,
                    param_config: true
                })

            }

            )


        }
    }

    // Clears setting for which tableau parameter to update
    public clearParam = (): void => {
        console.log('pause here!')
        this.setState((prevState) => ({
            allowableValues: {},
            configured: false,
            param_config: false,
            param_enabled: false,
            parameter: '',
            which_label: 0
        }));
        this.populateParamList();
    }

    public componentWillMount() {
        window.tableau.extensions.initializeDialogAsync().then(() => {
            dashboard = window.tableau.extensions.dashboardContent.dashboard;

            const settings = window.tableau.extensions.settings.getAll();
            console.log(`in compWillMount`)
            console.log(settings)
            if (settings.configured === 'true') {
                this.setState({
                    configured: true
                });

                this.testParamSettings();
            } else {

                this.populateParamList();
            }

            // this.setState({ready: true})       
        })


    }

    // handle changing the radio button from 0 or 1
    public whichChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ which_label: e.target.value==='0'?0:1})
    }

    // Handles selection in parameter dropdown
    public paramChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        this.setState({
            parameter: e.target.value
        });
    };

    public showNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            show_name: e.target.checked
        });
    };


    // Saves settings and closes configure dialog
    public submit = (): void => {
        console.log(`submit clicked`)
        this.setState((prevState) => ({ configured: true }))
        window.tableau.extensions.settings.set('configured', this.state.configured.toString());
        window.tableau.extensions.settings.set('which_label', this.state.which_label===0?'0':'1');
        window.tableau.extensions.settings.set('parameter', this.state.parameter);
        window.tableau.extensions.settings.set('bg', this.state.bg);
        window.tableau.extensions.settings.set('txt', this.state.txt);
        window.tableau.extensions.settings.set('show_name', this.state.show_name.toString());

        console.log(`getAll:`)

        console.log(window.tableau.extensions.settings.getAll())
        console.log(`this.state.configure: ${this.state.configured}`)
        window.tableau.extensions.settings.saveAsync().then(() => {
            console.log(`closing after submit (passing ${this.state.configured.toString()})`)
            window.tableau.extensions.ui.closeDialog(this.state.configured.toString());
        });
    }




    // Saves settings and closes configure dialog
    public cancel = (): void => {
        console.log(`cancel clicked`)
        this.clearParam();
        window.tableau.extensions.settings.set('configured', 'false');
        window.tableau.extensions.settings.set('which_label', '0');
        window.tableau.extensions.settings.set('parameter', '');
        window.tableau.extensions.settings.set('bg', '#ffffff');
        window.tableau.extensions.settings.set('txt', '#000000');
        window.tableau.extensions.settings.set('false', this.state.show_name);
        window.tableau.extensions.settings.saveAsync().then(() => {
            console.log(`closing after submit (passing ${this.state.configured.toString()})`)
            window.tableau.extensions.ui.closeDialog('false');
        });
    }

    public render() {





        return (
            <div className='p-4'>
                <div className='h1 pb-5'>
                    Singe Checkbox Parameters

                </div>

                <div className='d-inline'>

                    <div className='h4'>
                        Select the parameter
                    </div>
                    <Setting
                        onClick={this.setParam}
                        onClear={this.clearParam}
                        config={this.state.param_config}
                        enabled={this.state.param_enabled && !this.state.param_config}
                        selected={this.state.parameter}
                        list={this.state.param_list}
                        onChange={this.paramChange} />
                </div>



                <WhichLabel
                    allowableValues={this.state.allowableValues}
                    onChange={this.whichChange}
                    onClick={this.whichChange}
                    enabled={this.state.param_config}
                    checked={this.state.which_label}
                />
                <ShowName
                    show_name={this.state.show_name}
                    onChange={this.showNameChange}
                    onClick={this.showNameChange}
                    enabled={this.state.param_config} />

                <Colors bg={this.state.bg}
                    txt={this.state.txt}
                    onBGChange={this.bgChange}
                    onTXTChange={this.txtChange}
                    enabled={this.state.param_config}
                />

                <PreviewButton
                    allowableValues={this.state.allowableValues}
                    enabled={this.state.param_config}
                    which_label={this.state.which_label}
                    bg={this.state.bg}
                    txt={this.state.txt}
                    parameter={this.state.parameter}
                    show_name={this.state.show_name}
                />
                <div className='d-flex flex-row-reverse'>
                    <div className='p-2'>
                        <Button kind='filled' onClick={this.cancel} style={{ marginRight: '12px' }}>Clear </Button>
                        <Button disabled={!this.state.param_config} kind={this.state.param_config ? 'filledGreen' : 'outline'} onClick={this.submit}>Okay </Button>

                    </div>
                </div>

            </div>
        )
    }
}

export default Configure;