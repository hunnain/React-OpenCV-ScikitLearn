import cv2
from sklearn.cluster import KMeans

# class DominantOUTPUTCOLORS:

OUTPUTIMAGE = None
OUTPUTCOLORS = None
OutputLABELS = None
    
        #read OUTPUTIMAGE
outputImgDominantColor = cv2.imread('./uploads/author.jpg')  
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
print('Color',OUTPUTCOLORS.astype(int))
