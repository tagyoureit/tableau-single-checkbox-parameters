import * as React from 'react';
import { SingleCheckbox } from './SingleCheckbox'
import './style.css';
// import { settings } from 'cluster';

/* tslint:disable:no-console */

declare global {
    interface Window { tableau: any; }
}

let dashboard: any;
let unregisterHandler: any;

interface State {
    bg: any,
    checked: boolean;
    label: any;
    param_config: boolean;
    param_type: string;
    parameter: string;
    show_name: boolean;
    txt: any;
    value0: any;
    value1: any;
    which_label: number;
}

// helper function
function fakeWhiteOverlay(hex: string) {
    const rgb = hexToRgb(hex);
    if (rgb) {
        return `rgb(${Math.min(Math.floor(rgb.r / 2) + 127, 255)}, ${Math.min(Math.floor(rgb.g / 2) + 127, 255)}, ${Math.min(Math.floor(rgb.b / 2) + 127, 255)})`;
    } else {
        return '#ffffff';
    }
}

// helper function
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        b: parseInt(result[3], 16),
        g: parseInt(result[2], 16),
        r: parseInt(result[1], 16),
    } : null;
}

class BooleanFilter extends React.Component {
    public state: State = {
        bg: '#ffffff',
        checked: false,
        label: '',
        param_config: false,
        param_type: '',
        parameter: '',
        show_name: false,
        txt: '#000000',
        value0: '',
        value1: '',
        which_label: 0
    }


    public constructor(props: any) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.setParamData = this.setParamData.bind(this)
        this.resetParams = this.resetParams.bind(this)
        this.eventChange = this.eventChange.bind(this)
    }

    // Pops open the configure page if extension isn't configured
    public configure = (): void => {
        const popupUrl = (window.location.origin.includes('localhost')) ? `${window.location.origin}/#/config` : `${window.location.origin}/extension-data-driven-parameters/#/config`;
        const payload = '';
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 650, width: 450 }).then((closePayload: string) => {
            console.log(`returning from Configure! ${closePayload}`)
            if (closePayload === 'true') {
                this.getParamData();


            }
            else {
                this.resetParams();

            }
        }).catch((error: any) => {
            if (window.tableau.extensions.settings.get('configured') !== 'true') {
                this.resetParams()
            }
            switch (error.errorCode) {
                case window.tableau.ErrorCodes.DialogClosedByUser:
                    console.log('Dialog was closed by user.');
                    break;
                default:
                    console.error(error.message);
            }
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeAsync({ configure: this.configure }).then(() => {
            dashboard = window.tableau.extensions.dashboardContent.dashboard;
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured === 'true') {
                this.getParamData();
            } else {
                this.configure();
            }
        });
    }

    // reset all parameters
    public resetParams = () => {
        this.setState({
            bg: '#ffffff',
            label: '',
            param_config: false,
            param_type: '',
            parameter: '',
            show_name: false,
            txt: '#000000',
            value0: '',
            value1: '',
            which_label: 0
        })
    }

    // this function handles loading and of stored values and live params 
    public getParamData = (): void => {
        try {
            unregisterHandler()
            console.log(`Unregistering Event Handler`)
        }
        catch (err) {
            console.log(`Ignore error handler as it isn't set yet.`)
        }

        const settings = window.tableau.extensions.settings.getAll();
        dashboard.findParameterAsync(settings.parameter).then((param: any) => {

            this.setState((prevState) => ({
                bg: (settings.bg ? fakeWhiteOverlay(settings.bg) : '#ffffff'),
                param_type: param.dataType,
                parameter: param.name,
                show_name: settings.show_name === 'true' ? true : false,
                txt: settings.txt,
                value0: param.allowableValues.allowableValues[0].formattedValue,
                value1: param.allowableValues.allowableValues[1].formattedValue,

            }))
            document.body.style.backgroundColor = settings.bg;
            document.body.style.color = settings.txt;

            this.setState({
                label: param.allowableValues.allowableValues[settings.which_label].formattedValue,
                param_config: true,
            })

            unregisterHandler = param.addEventListener(window.tableau.TableauEventType.ParameterChanged, this.eventChange)

        }


        )
            .then(this.setParamData(false))
    }

    // if there is an event change then update the value of the parameter
    public eventChange = (): void => {

        dashboard.findParameterAsync(this.state.parameter).then((param: any) => {
            // if the current (real) parameter formatted value = the value that is displayed
            if (param.currentValue.formattedValue === this.state.label) {
                this.setState({ checked: true })

            }
            else {
                this.setState({ checked: false })
            }
        })
    }

    // this function is for a user clicking the checkbox in the checkbox parameter
    public onChange = (e: any): void => {

        this.setState({ checked: e.target.checked })
        this.setParamData(e.target.checked)
    }

    public setParamData = (checked: boolean) => {
        // const settings = window.tableau.extensions.settings.getAll();
        dashboard.findParameterAsync(this.state.parameter).then((param: any) => {
            console.log(param)
            console.log(`trying to set value: ${param.currentValue.formattedValue} for ${param.name}`)
            let currVal: any;

            // if the label is the first (0) position then send...
            // send value0 if checked===true, value1 if false
            // else if label is second in list (1)
            // send value1 if checked===true, value0 if false

            // assign the right value to the currVal item
            if (this.state.which_label === 0 && checked) {

                currVal = this.state.value0
            }
            else if (this.state.which_label === 0 && !checked) {

                currVal = this.state.value1
            }
            if (this.state.which_label === 1 && !checked) {

                currVal = this.state.value1
            }
            if (this.state.which_label === 1 && checked) {

                currVal = this.state.value0
            }


            param.changeValueAsync(currVal)


        })
    }

    public render() {



        return (
            <div className='container p-0 m-0 d-flex flex-fill w-100 align-self-center' style={{ height: '100%' }} >
                {!this.state.param_config ? 'Please Configure this extension!' :

                    (<SingleCheckbox onChange={this.onChange} onClick={this.onChange} checked={this.state.checked} label={this.state.label} txt={this.state.txt} bg={this.state.bg} parameter={this.state.parameter}
                        show_name={this.state.show_name}
                    />)
                }


            </div>
        )
    }
}

export default BooleanFilter;
