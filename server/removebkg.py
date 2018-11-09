import cv2
import numpy as np
import glob
from os import listdir
from os import chdir
from os.path import isfile, join
# from PIL import Image
from random import randint
import firebase_admin
from firebase_admin import credentials , db
from sklearn.cluster import KMeans


cred = credentials.Certificate("firebaseauth.json")
# firebase_admin.initialize_app(cred)

firebase_admin.initialize_app(options={
    'databaseURL': 'https://opencvbgremove.firebaseio.com/'
})

opencvbgremove = db.reference('opencvbgremove')



class RemoveBackground():

    #== Parameters =======================================================================
    BLUR = 21
    CANNY_THRESH_1 = 30
    CANNY_THRESH_2 = 90
    MASK_DILATE_ITER = 10
    MASK_ERODE_ITER = 10
    MASK_COLOR = (0.0,0.0,1.0) # In BGR format

    # Directory were is bulk of images
    directory = listdir('./uploads')
    chdir('./uploads')
    
    img = []
    for image in directory:
        img.append(image)

    img = np.array(img)
    # Appending images
    for name in img:
        im = cv2.imread(name)
        # b, g, r    = cv2.split(im)
        # print('b',b,'g',g,'r',r)
        img = cv2.imread(name)
        # Find Dominant Color in Input Image
        CLUSTERS = None
        IMAGE = None
        COLORS = None
        LABELS = None
            
                #read image
        inputImgDominantColor = cv2.imread(name)  
                #convert to rgb from bgr
        inputImgDominantColor = cv2.cvtColor(inputImgDominantColor, cv2.COLOR_BGR2RGB)     
                #reshaping to a list of pixels
        inputImgDominantColor = inputImgDominantColor.reshape((inputImgDominantColor.shape[0] * inputImgDominantColor.shape[1], 3))
                #save image after operations
        IMAGE = inputImgDominantColor
                #using k-means to cluster pixels
        kmeans = KMeans(n_clusters = 6)
        kmeans.fit(inputImgDominantColor)
                #the cluster centers are our dominant colors.
        COLORS = kmeans.cluster_centers_
                #save labels
        LABELS = kmeans.labels_
        print('Color',COLORS.astype(int))
        # End Dominant Color
        # print(np.unique(img, axis=0, return_counts = True))
        gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        # -- Edge detection -------------------------------------------------------------------
        edges = cv2.Canny(gray, CANNY_THRESH_1, CANNY_THRESH_2)
        edges = cv2.dilate(edges, None)
        edges = cv2.erode(edges, None)
        # -- Find contours in edges, sort by area ---------------------------------------------
        contour_info = []
        _, contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        # Previously, for a previous version of cv2, this line was: 
        #  contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        # Thanks to notes from commenters, I've updated the code but left this note
        for c in contours:
            contour_info.append((
                c,
                cv2.isContourConvex(c),
                cv2.contourArea(c),
            ))
        contour_info = sorted(contour_info, key=lambda c: c[2], reverse=True)
        max_contour = contour_info[0]

        # -- Create empty mask, draw filled polygon on it corresponding to largest contour ----
        # Mask is black, polygon is white
        mask = np.zeros(edges.shape)
        cv2.fillConvexPoly(mask, max_contour[0], (255))
        #-- Smooth mask, then blur it --------------------------------------------------------
        mask = cv2.dilate(mask, None, iterations=MASK_DILATE_ITER)
        mask = cv2.erode(mask, None, iterations=MASK_ERODE_ITER)
        mask = cv2.GaussianBlur(mask, (BLUR, BLUR), 0)
        mask_stack = np.dstack([mask]*3)    # Create 3-channel alpha mask
        #-- Blend masked img into MASK_COLOR background --------------------------------------
        mask_stack  = mask_stack.astype('float32') / 255.0          # Use float matrices, 
        img         = img.astype('float32') / 255.0                 #  for easy blending
        masked = (mask_stack * img) + ((1-mask_stack) * MASK_COLOR) # Blend
        masked = (masked * 255).astype('uint8')                     # Convert back to 8-bit 
        # split image into channels
        c_red, c_green, c_blue = cv2.split(img)
        # merge with mask got on one of a previous steps
        img_a = cv2.merge((c_red, c_green, c_blue, mask.astype('float32') / 255.0))
        # Creating Random Number for images
        randomNumber = randint(0,100)
        # Output Image name
        img_output = "add_removed"
        # Image output
        img_output = "../../client/dist/outputImages/outputImages/{}.png".format(name)
        # get dimensions of image
        InputHeight = img.shape[0]
        InputWidth = img.shape[1]
        Outputheight = img_a.shape[0]
        Outputwidth = img_a.shape[1]

        img_output = str(img_output)
        # save to disk
        cv2.imwrite(img_output , img_a*255)
        # Finding Most Dominant Color of Output Images
        OUTPUTIMAGE = None
        OUTPUTCOLORS = None
        OutputLABELS = None
        
                #read OUTPUTIMAGE
        img_outputpath = "../../client/dist/outputImages/outputImages/{}.png".format(name)        
        outputImgDominantColor = cv2.imread(img_outputpath)  
                #convert to rgb from bgr
        outputImgDominantColor = cv2.cvtColor(outputImgDominantColor, cv2.COLOR_BGR2RGB)     
                #reshaping to a list of pixels
        outputImgDominantColor = outputImgDominantColor.reshape((outputImgDominantColor.shape[0] * outputImgDominantColor.shape[1], 3))
                #save OUTPUTIMAGE after operations
        OUTPUTIMAGE = outputImgDominantColor
                #using k-means to cluster pixels
        kmeans = KMeans(n_clusters = 6)
        kmeans.fit(outputImgDominantColor)
                #the cluster centers are our dominant OUTPUTCOLORS.
        OUTPUTCOLORS = kmeans.cluster_centers_
                #save labels
        OutputLABELS = kmeans.labels_
        OutputColorDominant = OUTPUTCOLORS.astype(int).tolist()
        InputColorDominant = COLORS.astype(int).tolist()
        # End Most Dominant Color of Output Images
        # Firebase
        outputImageUrl = "{}.png".format(name)
        mydbdata = {
        'inputimages':name,
        'outputimages':outputImageUrl,
        'InputWidth':InputWidth,
        'InputHeight':InputHeight,
        'Outputwidth':Outputwidth,
        'Outputheight':Outputheight,
        'inputImageColor':InputColorDominant,
        'outputImageColor':OutputColorDominant
        }
        Db = opencvbgremove.child('data').push(mydbdata)
