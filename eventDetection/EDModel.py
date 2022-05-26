import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping
from pytorch_lightning.loggers import TensorBoardLogger
from transformers import BertTokenizer

import detector
from detector import Detector


class EDModel:

    def __init__(self):
        logger = TensorBoardLogger("lightning_logs", name="toxic-comments")
        checkpoint_callback = ModelCheckpoint(
                dirpath="checkpoints",
                filename="best-checkpoint",
                save_top_k=1,
                verbose=True,
                monitor="val_loss",
                mode="min"
        )
        early_stopping_callback = EarlyStopping(monitor='val_loss', patience=2)

        trainer = pl.Trainer(
                logger=logger,
                # checkpoint_callback=checkpoint_callback,
                callbacks=[checkpoint_callback, early_stopping_callback],
                max_epochs=1,
                gpus=0,
                # progress_bar_refresh_rate=30
        )
        trainer.checkpoint_callback.best_model_path = './checkpoints/best-checkpoint.ckpt'

        self.model = Detector.load_from_checkpoint(
                trainer.checkpoint_callback.best_model_path,
                n_classes=len(detector.LABEL_COLUMNS)
        )
        self.model.eval()
        self.model.freeze()

