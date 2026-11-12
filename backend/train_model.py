"""
EmotiLearn — CNN Emotion Model Training (Folder Version)
=========================================================
Trains a CNN on FER2013 dataset in folder format:

dataset/fer2013/
    train/
        angry/
        disgust/
        fear/
        happy/
        sad/
        surprised/
        neutral/
    test/
        angry/
        ...

Usage:
    python train_model.py --data ../dataset/fer2013 --epochs 60 --output models/
"""

import os
import argparse
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau
)

IMG_SIZE    = 48
BATCH_SIZE  = 64
NUM_CLASSES = 7
LR_INIT     = 1e-3

EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "sad", "surprised", "neutral"]


def build_model():
    inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 1), name="face_input")

    x = layers.Conv2D(32, 3, padding="same", use_bias=False)(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(32, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D(2)(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(64, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(64, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D(2)(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(128, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Conv2D(128, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.MaxPooling2D(2)(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(256, 3, padding="same", use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.GlobalAveragePooling2D()(x)

    x = layers.Dense(512, use_bias=False)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("relu")(x)
    x = layers.Dropout(0.5)(x)

    outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="emotion_probs")(x)

    model = keras.Model(inputs, outputs, name="EmotionNet")
    return model


def make_generators(data_dir):
    train_dir = os.path.join(data_dir, "train")
    test_dir  = os.path.join(data_dir, "test")

    print(f"[Train] Loading training data from: {train_dir}")
    print(f"[Train] Loading test data from:     {test_dir}")

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1,
        shear_range=0.05,
        validation_split=0.1
    )

    test_datagen = ImageDataGenerator(rescale=1.0 / 255)

    train_gen = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        color_mode="grayscale",
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        shuffle=True,
        classes=EMOTION_LABELS
    )

    val_gen = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        color_mode="grayscale",
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        classes=EMOTION_LABELS
    )

    test_gen = test_datagen.flow_from_directory(
        test_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        color_mode="grayscale",
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        shuffle=False,
        classes=EMOTION_LABELS
    )

    return train_gen, val_gen, test_gen


def plot_history(history, output_dir):
    try:
        fig, axes = plt.subplots(1, 2, figsize=(12, 4))
        axes[0].plot(history.history["accuracy"],     label="Train Acc",  color="cyan")
        axes[0].plot(history.history["val_accuracy"], label="Val Acc",    color="lime")
        axes[0].set_title("Accuracy")
        axes[0].set_xlabel("Epoch")
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        axes[1].plot(history.history["loss"],         label="Train Loss", color="cyan")
        axes[1].plot(history.history["val_loss"],     label="Val Loss",   color="lime")
        axes[1].set_title("Loss")
        axes[1].set_xlabel("Epoch")
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        plt.tight_layout()
        path = os.path.join(output_dir, "training_curves.png")
        plt.savefig(path, dpi=120)
        plt.close()
        print(f"[Train] Training curves saved to: {path}")
    except Exception as e:
        print(f"[Train] Could not save plot: {e}")


def train(data_dir, output_dir, epochs):
    os.makedirs(output_dir, exist_ok=True)

    train_dir = os.path.join(data_dir, "train")
    if not os.path.exists(train_dir):
        print(f"[ERROR] Train folder not found at: {train_dir}")
        print("[ERROR] Make sure your folder structure is:")
        print("        dataset/fer2013/train/angry/")
        print("        dataset/fer2013/train/happy/  etc.")
        return

    train_gen, val_gen, test_gen = make_generators(data_dir)

    print(f"\n[Train] Training samples:   {train_gen.samples}")
    print(f"[Train] Validation samples: {val_gen.samples}")
    print(f"[Train] Test samples:       {test_gen.samples}")
    print(f"[Train] Classes found:      {list(train_gen.class_indices.keys())}\n")

    model = build_model()
    model.summary()

    model.compile(
        optimizer=keras.optimizers.Adam(LR_INIT),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    model_path = os.path.join(output_dir, "emotion_cnn_fer2013.h5")

    callbacks = [
        ModelCheckpoint(
            model_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor="val_accuracy",
            patience=12,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1
        )
    ]

    print(f"[Train] Starting training for up to {epochs} epochs...")
    print(f"[Train] Model will be saved to: {model_path}\n")

    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1
    )

    print("\n[Train] Evaluating on test set...")
    test_loss, test_acc = model.evaluate(test_gen, verbose=0)
    print(f"\n[Train] Test Accuracy: {test_acc * 100:.2f}%")
    print(f"[Train] Model saved to: {model_path}")

    plot_history(history, output_dir)

    print("\n[Train] Training complete!")
    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train EmotionNet CNN on FER2013 folder dataset")
    parser.add_argument("--data",   default="../dataset/fer2013", help="Path to fer2013 folder containing train/ and test/")
    parser.add_argument("--epochs", default=60, type=int,         help="Max training epochs (default: 60)")
    parser.add_argument("--output", default="models/",            help="Output directory for model file")
    args = parser.parse_args()

    train(args.data, args.output, args.epochs)
