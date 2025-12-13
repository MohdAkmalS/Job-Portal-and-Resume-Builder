import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiX } from 'react-icons/fi';

const PasswordStrengthIndicator = ({ password, showCriteria = true }) => {
    const [criteria, setCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const [strength, setStrength] = useState('weak');

    // Update criteria and strength when password changes
    useEffect(() => {
        const newCriteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\{\}\[\]\/?..,]/.test(password)
        };
        setCriteria(newCriteria);

        // Calculate strength
        const metCount = Object.values(newCriteria).filter(Boolean).length;
        if (metCount <= 2) setStrength('weak');
        else if (metCount <= 4) setStrength('medium');
        else setStrength('strong');
    }, [password]);

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500'
    };

    const strengthTextColors = {
        weak: 'text-red-500',
        medium: 'text-yellow-500',
        strong: 'text-green-500'
    };

    const strengthWidth = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full'
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidth[strength]}`}
                    ></div>
                </div>
                <span className={`text-sm font-medium ${strengthTextColors[strength]} capitalize`}>
                    {strength}
                </span>
            </div>

            {/* Criteria Checklist */}
            {showCriteria && (
                <div className="text-xs space-y-1">
                    <CriteriaItem met={criteria.length} text="At least 8 characters" />
                    <CriteriaItem met={criteria.uppercase} text="One uppercase letter (A-Z)" />
                    <CriteriaItem met={criteria.lowercase} text="One lowercase letter (a-z)" />
                    <CriteriaItem met={criteria.number} text="One number (0-9)" />
                    <CriteriaItem met={criteria.special} text="One special character (!@#$%^&*...)" />
                </div>
            )}
        </div>
    );
};

const CriteriaItem = ({ met, text }) => (
    <div className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-gray-500'}`}>
        {met ? <FiCheck size={12} /> : <FiX size={12} />}
        <span>{text}</span>
    </div>
);

CriteriaItem.propTypes = {
    met: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
};

PasswordStrengthIndicator.propTypes = {
    password: PropTypes.string.isRequired,
    showCriteria: PropTypes.bool
};

export default PasswordStrengthIndicator;
