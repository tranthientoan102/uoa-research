import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping
from pytorch_lightning.loggers import TensorBoardLogger
from transformers import BertTokenizer, AutoModel

import detector
from detector import Detector


class EDModel:

    def __init__(self):

        self.model = Detector.load_from_checkpoint(
                './checkpoints/best-checkpoint.ckpt',
                n_classes=len(detector.LABEL_COLUMNS)
        )
        self.model.eval()
        self.model.freeze()

