import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class Navbar extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <div>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h5" color="inherit" >
                                Background Removal 
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </div>
            </div>
        )
    }
}

Navbar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Navbar);
