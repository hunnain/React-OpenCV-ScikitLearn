import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import ImagePalette from 'react-image-palette'
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import GridList from '@material-ui/core/GridList';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import './styles.css';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import red from '@material-ui/core/colors/red';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';


const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
}

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            files: [],
            outputImages: undefined,
            originalIMages: undefined,
            loading: false,
            openSnackbar: false,
            verticalSnackbar: 'top',
            horizontalSnackbar: 'center',
            dialogOpen: false,
            deleteImage: undefined,
            checking:undefined,
            uploadBtn : true,
        };
        this.uploadImage = this.uploadImage.bind(this);
        this.closeSnackbar = this.closeSnackbar.bind(this);
        // this.deleteDialogOpen = this.deleteDialogOpen.bind(this);
        this.deleteDialogClose = this.deleteDialogClose.bind(this);

    }

    onDrop(files) {
        this.setState({
            files: files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }))
        });
        const file = this.state.files
        // console.log("My console", file[0].file)
    }
    // ComponentDidmount 
    componentDidMount() {
        var dataArray = []
        let outputRGBArray = []
        axios.get("/firebasedata").then((res) => {
            let outputImage = res.data
            for (var k in outputImage) {
                if (outputImage.hasOwnProperty(k)) {
                    // Calculate Ratio of Image
                    let inputRatio = outputImage[k].InputWidth / outputImage[k].InputHeight
                    inputRatio = inputRatio.toFixed(2)
                    let outputRatio = outputImage[k].Outputwidth /  outputImage[k].Outputheight
                    outputRatio = outputRatio.toFixed(2)
                    var dataObj = {
                        inputimages : outputImage[k].inputimages,
                        outputimages : outputImage[k].outputimages,
                        key : k,
                        inputRatio: inputRatio,
                        outputRatio: outputRatio,
                        outputRGBValue : outputImage[k].outputImageColor,
                        inputRGBValue : outputImage[k].inputImageColor     
                    }
                    dataArray.push(dataObj)
                    this.setState({
                        outputImages: dataArray,
                        loading: false,
                        dialogOpen: false,
                    })
                }
            }
        })
    }
    componentWillUnmount() {
        // Make sure to revoke the data uris to avoid memory leaks
        const { files } = this.state;
        for (let i = files.length; i >= 0; i--) {
            const file = files[0];
            URL.revokeObjectURL(file.preview);
        }
    }

    uploadImage() {
        const th = this;
        // Upload Images
        const files = this.state.files
        var promise1 = new Promise(function(resolve, reject) {
        const maping = files.map(file => {
            // Initial FormData
            console.log('IMP file', file.file)
            const formData = new FormData();
            formData.append("file", file.file);
            formData.append("tags", `codeinfuse, medium, gist`);
            formData.append("upload_preset", "pvhilzh7"); // Replace the preset name with your own
            formData.append("api_key", "1234567"); // Replace API key with your own Cloudinary key
            formData.append("timestamp", (Date.now() / 1000) | 0);

            // Make an AJAX upload request using Axios (replace Cloudinary URL below with your own)
            var a = 's'
            return axios.post("/upload", formData, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            }).then(response => {
                    th.setState({
                        loading : true,
                        uploadBtn : false, 
                    })
            })
        });
        resolve(maping);
        });
        promise1.then((value) =>{
            axios.get("/processImage").then((res)=>{
                let data = res.data
                if (data) {
                    var dataArray = []
                    let outputRGBArray = []
                    axios.get("/firebasedata").then((res) => {
                        let outputImage = res.data
                        for (var k in outputImage) {
                            if (outputImage.hasOwnProperty(k)) {
                                // Calculate Ratio of Image
                                let inputRatio = outputImage[k].InputWidth / outputImage[k].InputHeight
                                inputRatio = inputRatio.toFixed(2)
                                let outputRatio = outputImage[k].Outputwidth /  outputImage[k].Outputheight
                                outputRatio = outputRatio.toFixed(2)
                                var dataObj = {
                                    inputimages : outputImage[k].inputimages,
                                    outputimages : outputImage[k].outputimages,
                                    key : k,
                                    inputRatio: inputRatio,
                                    outputRatio: outputRatio,
                                    outputRGBValue : outputImage[k].outputImageColor,
                                    inputRGBValue : outputImage[k].inputImageColor     
                                }
                                dataArray.push(dataObj)
                                this.setState({
                                    outputImages: dataArray,
                                    loading: false,
                                    dialogOpen: false,
                                    files: []
                                })
                            }
                        }
                    })
                }
            })
        })

    }
    // Copy to ClipBoard
    copyColor(ev) {
        navigator.clipboard.writeText(ev)
        this.setState({
            openSnackbar: true
        })
        setTimeout(() => {
            this.setState({
                openSnackbar: false
            })
        }, 1000)

    }

    // Close Snackbar
    closeSnackbar() {
        this.setState({
            openSnackbar: false
        })
    }
    // Image show in New Tab
    imgShowTab(ev) {
        console.log('my val', ev)
        let path = "/dist/outputImages/outputImages/"
        let imagePreview = path + ev
        var win = window.open(ev, '_blank');
        win.focus();
    }
    //  Open Delete Image Dialaog
    deleteDialogOpen(ev) {
        let deleteObj = {
            inputimages : ev.inputimages,
            outputimages : ev.outputimages,
            key : ev.key 
        }
        this.setState({
            dialogOpen: true,
            deleteImage: deleteObj
        })
    }
    // Close Delete Image Dialog
    deleteDialogClose() {
        this.setState({
            dialogOpen: false
        })
    }

    // Delete Image
    deleteImage(ev) {
        let deleteIMageUrl = this.state.deleteImage
        axios.post(`/deleteimage`, { deleteIMageUrl }).then((res => {
            let data = res.data
            if (data) {
                var dataArray = []
                let outputRGBArray = []
                axios.get("/firebasedata").then((res) => {
                    let outputImage = res.data
                    for (var k in outputImage) {
                        if (outputImage.hasOwnProperty(k)) {
                            // Calculate Ratio of Image
                            let inputRatio = outputImage[k].InputWidth / outputImage[k].InputHeight
                            inputRatio = inputRatio.toFixed(2)
                            let outputRatio = outputImage[k].Outputwidth /  outputImage[k].Outputheight
                            outputRatio = outputRatio.toFixed(2)
                            var dataObj = {
                                inputimages : outputImage[k].inputimages,
                                outputimages : outputImage[k].outputimages,
                                key : k,
                                inputRatio: inputRatio,
                                outputRatio: outputRatio,
                                outputRGBValue : outputImage[k].outputImageColor,
                                inputRGBValue : outputImage[k].inputImageColor     
                            }
                            dataArray.push(dataObj)
                            this.setState({
                                outputImages: dataArray,
                                loading: false,
                                dialogOpen: false,
                            })
                        }
                    }
                })
            }
        }))
    }
    render() {
        const { files } = this.state;

        const thumbs = files.map(file => (
            <div style={thumb}>
                <div style={thumbInner}>
                    <img
                        src={file.preview}
                        style={img}
                    />
                </div>
            </div>
        ));
        const { loading, outputImages, openSnackbar, verticalSnackbar, horizontalSnackbar, originalIMages, uploadBtn } = this.state
        console.log('state data', this.state)
        const path = "/dist/outputImages/outputImages/"
        const originalPath = "/dist/outputImages/originalImages/"
        return (
            // <Paper elevation={1}>
            <div>
                <div>
                    {/* Snackbar to copy Text*/}
                    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={openSnackbar} SnackbarContentProps={{ 'aria-describedby': 'message-id', }} message={<span id="formchecking">Color Copied to Clipboard</span>} />
                    <Typography variant="h4" id="typographyUpload">
                        <b id="ImageUploadText">Upload your Multiple Images</b> <br />
                        Drop your Image or either Select it.
                    </Typography>
                    <section id="uploadSection">
                        <div className="dropzone">
                            <Dropzone
                                accept="image/*"
                                onDrop={this.onDrop.bind(this)}
                            />
                        </div>
                        <aside style={thumbsContainer}>
                            {thumbs}
                        </aside>
                        {
                            (uploadBtn)?
                            <Button variant="outlined" color="primary" id="uploadBtn" onClick={this.uploadImage}>
                            Upload
                            <CloudUploadIcon />
                            </Button>
                            :
                            <Button variant="outlined" color="primary" disabled id="uploadBtn">
                            Upload
                            <CloudUploadIcon />
                            </Button>
                        }
                    </section>
                    <Typography variant="h4" id="typogragphyOutput">
                        {
                            (outputImages) ?
                                <b id="ImageOutputText">Output Images</b>
                                :
                                <b id="ImageOutputText">Image Not Found</b>
                        }
                    </Typography>
                    {/* Show Output Images */}

                    {
                        (loading) ?
                            <div className="loader">
                                <CircularProgress size={70} />
                            </div>
                            :
                            <div>
                                {/* <GridList cellHeight={400} className="gridList"> */}
                                {
                                    (outputImages) ?
                                        outputImages.map((val, key) => {
                                            console.log('My vaues',val,key)
                                            return (
                                                <div>
                                                <GridList cellHeight={450} className="gridList">
                                                        <Card className="card" raised={true} root key={key}>
                                                                <CardMedia
                                                                    component="img"
                                                                    alt="Contemplative Reptile"
                                                                    className="media"
                                                                    height="240"
                                                                    image={path + val.outputimages}
                                                                    title="Output Images"
                                                                />
                                                                <CardContent>
                                                                <Typography gutterBottom variant="h5" component="h2">
                                                                    OpenCV Output
                                                                </Typography>
                                                                    <Typography gutterBottom variant="h6" component="h2">
                                                                        Color Plattee
                                                                </Typography>
                                                                {
                                                                    val.outputRGBValue.map((val,key)=>{
                                                                        var rgbValues = `rgb(${val[0]},${val[1]},${val[2]})`
                                                                      return(
                                                                            <div style={{display: 'inline-block'}}>
                                                                                <Tooltip title={rgbValues} placement="left">
                                                                                    <span onClick={this.copyColor.bind(this, rgbValues)} style={{ width: 30, height: 30, display: 'inline-block', backgroundColor: rgbValues }}></span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        // )}
                                                                      )
                                                                    })
                                                                }
                                                                    <Typography variant="h6">Ratio:{val.outputRatio}</Typography>
                                                                    <div>
                                                                    </div>
                                                                </CardContent>
                                                            <CardActions>
                                                                {/* Dialog */}
                                                                <Dialog
                                                                    open={this.state.dialogOpen}
                                                                    onClose={this.deleteDialogClose}
                                                                    aria-labelledby="alert-dialog-title"
                                                                    aria-describedby="alert-dialog-description"
                                                                >
                                                                    <DialogTitle id="alert-dialog-title">Delete Image?</DialogTitle>
                                                                    <DialogContent>
                                                                        <DialogContentText id="alert-dialog-description">
                                                                            Are you sure you want to delete this image?
                                                                </DialogContentText>
                                                                    </DialogContent>
                                                                    <DialogActions>
                                                                        <Button onClick={this.deleteDialogClose} autoFocus color="primary">
                                                                            Close
                                                                    </Button>
                                                                        <Button onClick={this.deleteImage.bind(this, val.outputimages)} color="secondary">
                                                                            Delete
                                                                    </Button>
                                                                    </DialogActions>
                                                                </Dialog>
                                                                <Button size="medium" onClick={this.imgShowTab.bind(this, path + val.outputimages)} color="primary">
                                                                    Preview
                                                            </Button>
                                                                <Button size="small" color="primary">
                                                                    <a href={path + val.outputimages} download>Direct Download</a>
                                                                </Button>
                                                                <IconButton onClick={()=>this.deleteDialogOpen(val)} aria-label="Delete">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </CardActions>
                                                        </Card>
                                                    {/* Original Image*/}
                                        <Card className="card">
                                                <CardMedia
                                                    component="img"
                                                    alt="Original Image"
                                                    className="media"
                                                    height="240"
                                                    image={originalPath + val.inputimages}
                                                    title="Original Image"
                                                />
                                                <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                        Original Image
                                                    </Typography>
                                                    <Typography gutterBottom variant="h6" component="h2">
                                                        Color Plattee
                                                    </Typography>
                                                    {
                                                                    val.inputRGBValue.map((val,key)=>{
                                                                        var rgbValues = `rgb(${val[0]},${val[1]},${val[2]})`
                                                                      return(
                                                                            <div style={{display: 'inline-block'}}>
                                                                                <Tooltip title={rgbValues} placement="left">
                                                                                    <span onClick={this.copyColor.bind(this, rgbValues)} style={{ width: 30, height: 30, display: 'inline-block', backgroundColor: rgbValues }}></span>
                                                                                </Tooltip>
                                                                            </div>
                                                                        // )}
                                                                      )
                                                                    })
                                                    }
                                                    <Typography variant="h6">Ratio:{val.inputRatio}</Typography>
                                                    <div>
                                                    </div>
                                                </CardContent>
                                            <CardActions>
                                                {/* Dialog */}
                                                <Dialog
                                                    open={this.state.dialogOpen}
                                                    onClose={this.deleteDialogClose}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogTitle id="alert-dialog-title">Delete Image?</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            Are you sure you want to delete this image?
                                                            Note: It will delete Original and Output Image
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={this.deleteDialogClose} autoFocus color="primary">
                                                            Close
                                                        </Button>
                                                        <Button onClick={this.deleteImage.bind(this, val.inputimages)} color="secondary">
                                                            Delete
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                                <Button size="medium" onClick={this.imgShowTab.bind(this, originalPath + val.inputimages)} color="primary">
                                                    Preview
                                                </Button>
                                                <Button size="small" color="primary">
                                                    <a href={originalPath + val.inputimages} download>Direct Download</a>
                                                </Button>
                                                <IconButton onClick={()=>this.deleteDialogOpen(val)} aria-label="Delete">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </CardActions>
                                        </Card>
                                        </GridList>
                                                    </div>
                                            )
                                        })
                                        :
                                        <div></div>
                                }
                                {/* </GridList> */}
                            </div>
                            }

                </div>
            </div>
            // </Paper>
        )
    }

}
export default App;