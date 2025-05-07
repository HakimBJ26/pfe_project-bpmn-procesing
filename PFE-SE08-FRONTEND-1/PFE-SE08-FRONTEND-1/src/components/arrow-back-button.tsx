import { ArrowLeftIcon } from "lucide-react";

const ArrowBackButton = () => {
    return (
        <a
            href={"/tasks"}
            className="inline-flex items-center border border-gray-900 px-3 py-1.5 rounded-md text-gray-900 hover:bg-indigo-50"
        >
            <ArrowLeftIcon size={18} />
        </a>
    );
};

export { ArrowBackButton };
