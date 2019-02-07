import * as React from 'react';
import './home.css';

class Home extends React.Component<any, any> {
    public render() {
        return (
			<React.Fragment>
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<h1 className='iheader'>Single Checkbox Parameters</h1>
							<span className='tagline'>A new way to choose between two values.</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>This extension allows you to have a single checkbox that can toggle between two values.  </p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
								<li>Create a parameter with a list of 2 values.</li>
								<li>Drag in a new Extension object to your dashboard.</li>
								<li>Find the manifest (single-checkbox-parameter.trex) <a href='https://tagyoureit.github.io/tableau-single-checkbox-parameters/single-checkbox-parameter.trex'>file</a> you downloaded.</li>
								<li>Select the parameter you created above for the extension to manipulate.</li>
								<li>Select the options as presented.</li>
								<li>Click 'OK'.</li>
							</ol>
							<p><b>Note:</b> You can add as many instances of this extension as you like!</p>
							<div className='gh' style={{paddingTop: '10px'}}>
								Get this extension and more in the <a href='https://extensiongallery.tableau.com/'>Extension Gallery</a>.
								<br />
								<a href='https://github.com/tableau/extension-data-driven-parameters'>View on GitHub</a>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
        );
    }
}

export default Home;