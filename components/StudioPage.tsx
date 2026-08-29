import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

const UploadIcon: React.FC = () => (
    <svg className="w-12 h-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-dark"></div>
        <p className="text-brand-secondary">Generating your portrait, please wait...</p>
    </div>
);

const StudioPage: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourceImage(reader.result as string);
                setResultImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const generatePortrait = async () => {
        if (!sourceImage) {
            setError("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64ImageData = sourceImage.split(',')[1];
            const mimeType = sourceImage.split(';')[0].split(':')[1];

            const prompt = `A cinematic black and white portrait of the person in the image, keeping their real face unchanged. They are standing in profile, leaning with their back against a smooth wall, their posture relaxed yet elegant. Their head is tilted slightly backward, chin raised, and eyes are closed, giving the impression of calmness and introspection. Their left arm rests naturally along their body, while their right arm is bent at the elbow, holding a clear glass tumbler near waist height with a relaxed grip. They are wearing a crisp, fitted white button-down shirt with the sleeves casually rolled up to the elbows, the fabric slightly stretched across their chest and arms, emphasizing a tailored silhouette. The shirt is tucked neatly into a pair of dark, well-fitted trousers, secured with a slim black belt. No additional accessories, keeping the look timeless and minimalistic. The lighting is dramatic and high-contrast, with soft highlights defining their facial structure, shirt creases, and the glass, while deep shadows enhance the mood of the scene. The monochrome tones create a refined, classic aesthetic. The camera captures them at eye-level, framed from the thighs up, using a portrait focal length of around 85mm, giving natural proportions and a cinematic depth. The background is plain and dark, ensuring the focus remains entirely on their pose, expression, and the play of light and shadow. Style: timeless, black and white photography, cinematic, moody, fashion editorial, professional model portrait. same face.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    setResultImage(imageUrl);
                    foundImage = true;
                    break;
                }
            }

            if (!foundImage) {
                 for (const part of response.candidates[0].content.parts) {
                    if (part.text) {
                        console.log("Model text response:", part.text);
                        setError(`Model response: ${part.text}`);
                        break;
                    }
                }
                if (!error) {
                    setError("The model did not return an image. Please try a different photo.");
                }
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`An error occurred while generating the image: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-grow flex flex-col h-screen">
            <main className="flex-grow p-6 overflow-y-auto pb-28 pt-6">
                <h1 className="text-4xl font-medium text-brand-primary">AI Portrait Studio</h1>
                <p className="text-brand-secondary mt-2 mb-8">
                    Upload a photo of yourself to generate a cinematic, black and white portrait.
                </p>

                {sourceImage ? (
                    <div className="mb-6 text-center">
                        <img src={sourceImage} alt="Uploaded portrait" className="max-w-full mx-auto rounded-lg shadow-md max-h-64" />
                        <button onClick={() => setSourceImage(null)} className="mt-4 text-sm text-brand-accent font-semibold hover:underline">
                            Change Image
                        </button>
                    </div>
                ) : (
                    <div className="mb-6">
                        <label htmlFor="image-upload" className="relative block w-full h-48 border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent cursor-pointer flex flex-col justify-center items-center">
                           <UploadIcon />
                            <span className="mt-2 block text-sm font-medium text-gray-600">
                                Upload your portrait
                            </span>
                        </label>
                        <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </div>
                )}
                
                <button 
                    onClick={generatePortrait} 
                    disabled={!sourceImage || isLoading}
                    className="w-full py-4 px-6 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isLoading ? 'Generating...' : 'Generate Cinematic Portrait'}
                </button>

                <div className="mt-8">
                    {isLoading && <LoadingSpinner />}
                    {error && <div className="text-red-600 bg-red-100 border border-red-400 rounded-lg p-4 text-center">{error}</div>}
                    {resultImage && (
                        <div>
                            <h2 className="text-2xl font-medium text-brand-primary mb-4 text-center">Your Cinematic Portrait</h2>
                            <img src={resultImage} alt="Generated cinematic portrait" className="w-full rounded-lg shadow-xl" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudioPage;