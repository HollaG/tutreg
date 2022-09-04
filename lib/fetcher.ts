export default async function fetcher<JSON = any>(
    input: RequestInfo,
    init?: RequestInit
): Promise<JSON> {
    const res = await fetch(input, init);
    return res.json();
}

export const sendPOST = async (url: string, data: any) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const responseData = await res.json();
    return responseData;
};

export const sendDELETE = async (url: string, data: any) => {
    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const responseData = await res.json();
    return responseData;
};

export const sendPATCH = async (url: string, data: any) => {
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const responseData = await res.json();
    return responseData;
};

export const sendPOSTFormData = async (url: string, data: any) => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        body: data,
    });
    const responseData = await res.json();
    return responseData;
};
